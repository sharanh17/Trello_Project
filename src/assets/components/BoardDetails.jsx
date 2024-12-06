import { useState, useContext, useEffect } from "react";
import { ApiContext } from "./context/apiContext";
import BackButton from "./BackButton";
import CreateListForm from "./CreateListForm";
import PointCard from "./PointCard";
import ChecklistModal from "./ChecklistModal";
import { Box, Button, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addList, deleteList } from "../slices/boardDetailsSlice";

const BoardDetails = () => {
  const { boardId } = useParams();
  const { API_KEY, TOKEN, API_URL } = useContext(ApiContext);
  const [listTitle, setListTitle] = useState("");
  const [points, setPoints] = useState([""]);
  const [showForm, setShowForm] = useState(false);
  const [newPoint, setNewPoint] = useState("");
  const [isAddingPoint, setIsAddingPoint] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lists = useSelector((state) => state.list.data);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch(
          `${API_URL}boards/${boardId}/lists?key=${API_KEY}&token=${TOKEN}`
        );
        const data = await response.json();
        const listsWithCards = await Promise.all(
          data.map(async (list) => {
            const cardsResponse = await fetch(
              `https://api.trello.com/1/lists/${list.id}/cards?key=${API_KEY}&token=${TOKEN}`
            );
            const cards = await cardsResponse.json();
            return {
              ...list,
              points: cards,
            };
          })
        );
        dispatch(addList(listsWithCards));
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };

    fetchLists();
  }, [boardId, dispatch]);

  const addPoint = async (listId) => {
    if (newPoint.trim()) {
      try {
        const response = await fetch(
          `${API_URL}cards?key=${API_KEY}&token=${TOKEN}&idList=${listId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newPoint }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add point to Trello");
        }

        const newCard = await response.json();
        dispatch(
          addList(
            lists.map((list) =>
              list.id === listId
                ? { ...list, points: [...list.points, newCard] }
                : list
            )
          )
        );
        setNewPoint("");
        setIsAddingPoint((prev) => ({ ...prev, [listId]: false }));
      } catch (error) {
        console.error("Error adding point:", error);
      }
    }
  };

  const deletePoint = async (listId, pointId) => {
    try {
      const response = await fetch(
        `${API_URL}cards/${pointId}?key=${API_KEY}&token=${TOKEN}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete point");
      }

      dispatch(
        addList(
          lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  points: list.points.filter((point) => point.id !== pointId),
                }
              : list
          )
        )
      );
    } catch (error) {
      console.error("Error deleting point:", error);
    }
  };

  const handleFormSubmit = async () => {
    if (listTitle.trim() && points.some((point) => point.trim())) {
      try {
        const listResponse = await fetch(
          `${API_URL}lists?key=${API_KEY}&token=${TOKEN}&name=${listTitle}&idBoard=${boardId}`,
          { method: "POST", headers: { "Content-Type": "application/json" } }
        );

        if (!listResponse.ok) {
          throw new Error("Failed to create list");
        }

        const listData = await listResponse.json();

        const validPoints = points.filter((point) => point.trim());
        for (const point of validPoints) {
          const cardResponse = await fetch(
            `${API_URL}cards?key=${API_KEY}&token=${TOKEN}&idList=${listData.id}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: point }),
            }
          );

          if (cardResponse.ok) {
            const cardData = await cardResponse.json();
            listData.points = listData.points || [];
            listData.points.push(cardData);
          } else {
            console.error("Error creating card:", point);
          }
        }

        dispatch(addList(listData));
        setShowForm(false);
        setListTitle("");
        setPoints([""]);
      } catch (error) {
        console.error("Error creating list or points:", error);
      }
    }
  };

  return (
    <Box>
      <Box py={2} bgcolor={"grey"}>
        <Typography variant="h4">Board Details</Typography>
      </Box>
      <Box>
        <BackButton />
        {!showForm && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowForm(true)}
          >
            Create List
          </Button>
        )}
      </Box>

      {showForm && (
        <CreateListForm
          listTitle={listTitle}
          setListTitle={setListTitle}
          points={points}
          setPoints={setPoints}
          handleFormSubmit={handleFormSubmit}
          setShowForm={setShowForm}
        />
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        {lists.map((list) => (
          <PointCard
            key={list.id}
            list={list}
            isAddingPoint={isAddingPoint}
            setIsAddingPoint={setIsAddingPoint}
            newPoint={newPoint}
            setNewPoint={setNewPoint}
            addPoint={addPoint}
            deletePoint={deletePoint}
            deleteList={(listId) => dispatch(deleteList(listId))}
          />
        ))}
      </Box>

      {isModalOpen && <ChecklistModal onClose={() => setIsModalOpen(false)} />}
    </Box>
  );
};

export default BoardDetails;
