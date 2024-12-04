import { useState, useContext, useEffect } from "react";
import { ApiContext } from "./context/apiContext";
import BackButton from "./BackButton";
import CreateListForm from "./CreateListForm";
import PointCard from "./PointCard";
import ChecklistModal from "./ChecklistModal";
import { Container, Box, Button, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const BoardDetails = () => {
  const { boardId } = useParams();
  const { API_KEY, TOKEN } = useContext(ApiContext);
  const [lists, setLists] = useState([]);
  const [board, setBoard] = useState([]);
  const [listTitle, setListTitle] = useState("");
  const [points, setPoints] = useState([""]);
  const [showForm, setShowForm] = useState(false);
  const [newPoint, setNewPoint] = useState("");
  const [isAddingPoint, setIsAddingPoint] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const boardRedux = useSelector((store) => store.board.data);

  // const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await fetch(
          `https://api.trello.com/1/boards/${boardId}?key=${API_KEY}&token=${TOKEN}`
        );
        const data = await response.json();
        setBoard(data);
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };
    const fetchLists = async () => {
      try {
        const response = await fetch(
          `https://api.trello.com/1/boards/${boardId}/lists?key=${API_KEY}&token=${TOKEN}`
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
        setLists(listsWithCards);
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };

    fetchLists();
    if (boardRedux.length > 0) {
      const currentBoard = boardRedux.find((board) => board.id === boardId);
      setBoard(currentBoard);
    } else {
      fetchBoard();
    }
  }, [boardId]);

  const addPoint = async (listId) => {
    if (newPoint.trim()) {
      try {
        const tempPoint = { name: newPoint, id: Date.now() };
        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === listId
              ? { ...list, points: [...list.points, tempPoint] }
              : list
          )
        );

        setIsAddingPoint((prev) => ({ ...prev, [listId]: false }));
        setNewPoint("");

        const response = await fetch(
          `https://api.trello.com/1/cards?key=${API_KEY}&token=${TOKEN}&idList=${listId}`,
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

        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  points: list.points.map((point) =>
                    point.id === tempPoint.id ? newCard : point
                  ),
                }
              : list
          )
        );
      } catch (error) {
        console.error("Error adding point:", error);
      }
    }
  };

  const deletePoint = async (listId, pointId) => {
    try {
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId
            ? {
                ...list,
                points: list.points.filter((point) => point.id !== pointId),
              }
            : list
        )
      );

      const response = await fetch(
        `https://api.trello.com/1/cards/${pointId}?key=${API_KEY}&token=${TOKEN}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete point");
      }
    } catch (error) {
      console.error("Error deleting point:", error);
    }
  };

  const deleteList = async (listId) => {
    try {
      setLists((prevLists) => prevLists.filter((list) => list.id !== listId));

      const response = await fetch(
        `https://api.trello.com/1/lists/${listId}/closed?key=${API_KEY}&token=${TOKEN}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: true }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete list");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const handleFormSubmit = async () => {
    if (listTitle.trim() && points.some((point) => point.trim())) {
      try {
        const listResponse = await fetch(
          `https://api.trello.com/1/lists?key=${API_KEY}&token=${TOKEN}&name=${listTitle}&idBoard=${boardId}`,
          { method: "POST", headers: { "Content-Type": "application/json" } }
        );

        if (!listResponse.ok) {
          throw new Error("Failed to create list");
        }

        const listData = await listResponse.json();

        setLists((prevLists) => [...prevLists, { ...listData, points: [] }]);

        const validPoints = points.filter((point) => point.trim());

        for (const point of validPoints) {
          const cardResponse = await fetch(
            `https://api.trello.com/1/cards?key=${API_KEY}&token=${TOKEN}&idList=${listData.id}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: point }),
            }
          );

          if (cardResponse.ok) {
            const cardData = await cardResponse.json();
            setLists((prevLists) =>
              prevLists.map((list) =>
                list.id === listData.id
                  ? { ...list, points: [...list.points, cardData] }
                  : list
              )
            );
          } else { 
            console.error("Error creating card:", point);
          }
        }

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
        <Typography variant="h4">{board.name}</Typography>
      </Box>
      <Box>
        <BackButton />
        {!showForm && (
          <Button
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              backgroundColor: "#4caf50",
              "&:hover": { backgroundColor: "#388e3c" },
              padding: "8px 16px",
              fontSize: "16px",
              borderRadius: "8px",
            }}
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

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          mt: 4,
          justifyContent: "flex-start",
        }}
      >
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
            deleteList={deleteList}
          />
        ))}
      </Box>

      {isModalOpen && (
        <ChecklistModal
          point={selectedPoint}
          onClose={() => setIsModalOpen(false)}
          boardId={boardId}
        />
      )}
    </Box>
  );
};

export default BoardDetails;
