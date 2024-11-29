import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiContext } from "./context/apiContext";
import {
  Paper,
  Container,
  Box,
  Typography,
  Button,
  Popover,
  TextField,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [boardData, setBoardData] = useState([]);
  const { API_KEY, TOKEN } = useContext(ApiContext);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.trello.com/1/members/me/boards?key=${API_KEY}&token=${TOKEN}`
      );
      const data = await response.json();
      setBoardData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function addData(name) {
    try {
      const response = await fetch(
        `https://api.trello.com/1/boards/?name=${name}&key=${API_KEY}&token=${TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const newBoard = await response.json();
        setBoardData((prevData) => [...prevData, newBoard]);
        setAnchorEl(null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteBoard(boardId) {
    try {
      const response = await fetch(
        `https://api.trello.com/1/boards/${boardId}?key=${API_KEY}&token=${TOKEN}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setBoardData((prevData) =>
          prevData.filter((board) => board.id !== boardId)
        );
      }
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  }

  function addBoard(event) {
    const value = event.target.value;
    if (event.which === 13) {
      addData(value);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container
      sx={{
        backgroundColor: "black",
        minHeight: "88vh",
        minWidth: "100vw",
        py: 5,
      }}
    >
      {loading ? (
        <Typography color="white" variant="h6" textAlign="center">
          Loading...
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            justifyContent: "center",
          }}
        >
          {/* Button to Add New Board */}
          <Button
            onClick={handleClick}
            sx={{
              width: 200,
              height: 100,
              backgroundColor: "#FFC1E3", // Light pink
              color: "black",
              fontSize: "16px",
              fontWeight: "bold",
              border: "none",
              "&:hover": { backgroundColor: "#FFA6D4" }, // Slightly darker pink
            }}
          >
            + Add Board
          </Button>

          {/* Popover for Adding a New Board */}
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            sx={{ p: 2 }}
          >
            <Box sx={{ p: 2 }}>
              <TextField
                label="Board title"
                variant="outlined"
                fullWidth
                onKeyDown={addBoard}
              />
            </Box>
          </Popover>

          {/* Existing Boards */}
          {boardData.map((data) => (
            <Paper
              key={data.id}
              elevation={4}
              sx={{
                width: 200,
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#FFC1E3", // Light pink
                color: "black",
                borderRadius: 4,
                padding: "10px",
              }}
            >
              <Link
                to={`/board/${data.id}`}
                style={{
                  textDecoration: "none",
                  color: "black",
                  flex: 1,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {data.name}
                </Typography>
              </Link>
              <IconButton
                aria-label="delete"
                onClick={() => deleteBoard(data.id)}
                sx={{ color: "black" }}
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
