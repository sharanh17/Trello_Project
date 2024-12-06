import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Checkbox,
  Slider,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useContext, useEffect } from "react";
import { ApiContext } from "./context/apiContext";

const ChecklistModal = ({ cardId, point, onClose }) => {
  const [checklists, setChecklists] = useState([]);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [newItems, setNewItems] = useState({});
  const [error, setError] = useState(null);
  const { API_KEY, TOKEN, API_URL } = useContext(ApiContext);

  const handleCreateChecklist = async () => {
    if (!newChecklistName.trim()) return;

    const url = `${API_URL}checklists?idCard=${cardId}&name=${newChecklistName}&key=${API_KEY}&token=${TOKEN}`;

    try {
      const response = await fetch(url, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setChecklists([
          ...checklists,
          { id: data.id, name: newChecklistName, items: [] },
        ]);
        setNewChecklistName("");
        setError(null);
      } else {
        const errorResponse = await response.text();
        console.error("API Error:", errorResponse);
        setError("Failed to create checklist. Please try again.");
      }
    } catch (error) {
      console.error("Error creating checklist:", error);
      setError("An error occurred while creating the checklist.");
    }
  };

  const handleItemInputChange = (checklistId, value) => {
    setNewItems((prev) => ({ ...prev, [checklistId]: value }));
  };

  const handleAddItem = async (checklistId) => {
    const item = newItems[checklistId]?.trim();
    if (item) {
      const url = `${API_URL}checklists/${checklistId}/checkItems?name=${item}&key=${API_KEY}&token=${TOKEN}`;

      try {
        const response = await fetch(url, {
          method: "POST",
        });

        if (response.ok) {
          const data = await response.json();

          const updatedChecklists = checklists.map((checklist) => {
            if (checklist.id === checklistId) {
              return {
                ...checklist,
                items: [
                  ...checklist.items,
                  { id: data.id, name: data.name, state: "incomplete" },
                ],
              };
            }
            return checklist;
          });

          setChecklists(updatedChecklists);
          setNewItems((prev) => ({ ...prev, [checklistId]: "" }));
        } else {
          console.error("Error adding item:", await response.text());
        }
      } catch (error) {
        console.error("Error adding item:", error);
      }
    }
  };

  async function updatedChecklistItems(url) {
    try {
      const response = await fetch(url, {
        method: "PUT",
      });
      const data = await response.json();
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  }

  const toggleItemChecked = (checklistId, itemId, isChecked) => {
    const updatedChecklists = checklists.map((checklist) => {
      if (checklist.id === checklistId) {
        const state = !isChecked ? "complete" : "incomplete";
        const url = `${API_URL}cards/${cardId}/checkItem/${itemId}?state=${state}&key=${API_KEY}&token=${TOKEN}`;
        updatedChecklistItems(url);
        return {
          ...checklist,
          items: checklist.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      }
      return checklist;
    });
    setChecklists(updatedChecklists);
  };

  const handleDeleteItem = (checklistId, itemId) => {
    const updatedChecklists = checklists.map((checklist) => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.filter((item) => item.id !== itemId),
        };
      }
      return checklist;
    });
    setChecklists(updatedChecklists);
  };

  const calculateCompletion = (checklist) => {
    const total = checklist.items.length;
    console.log(total);
    const completed = checklist.items.filter(
      (item) => item.state === "complete" || item.checked
    ).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  async function getChecklistItems() {
    const url = `${API_URL}cards/${cardId}/checklists?key=${API_KEY}&token=${TOKEN}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const newChecklistItems = await Promise.all(
        data.map(async (checklist) => {
          const itemsResponse = await fetch(
            `${API_URL}checklists/${checklist.id}/checkItems?key=${API_KEY}&token=${TOKEN}`
          );
          const items = await itemsResponse.json();
          return {
            ...checklist,
            items: items,
          };
        })
      );
      setChecklists(newChecklistItems);
    } catch (error) {
      console.error("Error fetching checklist:", error);
    }
  }

  useEffect(() => {
    getChecklistItems();
  }, []);

  return (
    <Modal open={true} onClose={onClose}>
      <Box
        sx={{
          p: 3,
          bgcolor: "white",
          borderRadius: 2,
          maxWidth: 500,
          mx: "auto",
          mt: 10,
          boxShadow: 4,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Checklists for {point}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="New Checklist Name"
            value={newChecklistName}
            onChange={(e) => setNewChecklistName(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleCreateChecklist}>
            Create
          </Button>
        </Box>

        {checklists.map((checklist) => (
          <Box
            key={checklist.id}
            sx={{
              border: "1px solid gray",
              borderRadius: 1,
              p: 2,
              mb: 2,
              bgcolor: "#f9f9f9",
            }}
          >
            <Typography variant="h6">{checklist.name}</Typography>

            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Completion: {calculateCompletion(checklist)}%
              </Typography>
              <Slider
                value={calculateCompletion(checklist)}
                disabled
                step={1}
                min={0}
                max={100}
              />
            </Box>

            <Box>
              {checklist.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={item.checked}
                      onChange={() =>
                        toggleItemChecked(checklist.id, item.id, item.checked)
                      }
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: item.checked ? "line-through" : "none",
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteItem(checklist.id, item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                label="New Item"
                value={newItems[checklist.id] || ""}
                onChange={(e) =>
                  handleItemInputChange(checklist.id, e.target.value)
                }
                fullWidth
              />
              <Button
                variant="contained"
                onClick={() => handleAddItem(checklist.id)}
              >
                Add
              </Button>
            </Box>
          </Box>
        ))}

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 3 }}
          onClick={onClose}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default ChecklistModal;
