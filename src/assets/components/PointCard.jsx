import { useState } from "react";
import ChecklistModal from "./ChecklistModal";
import { RxCross1 } from "react-icons/rx";
import {
  Card,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const PointCard = ({
  list,
  isAddingPoint,
  setIsAddingPoint,
  newPoint,
  setNewPoint,
  addPoint,
  deletePoint,
  deleteList,
}) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedCardID, setSelectedCardID] = useState(null);



  return (
    <Card
      sx={{
        width: 250,
        p: 2,
        boxShadow: 2,
        borderRadius: 1,
        flexShrink: 0,
        flexGrow: 0,
        width: "200px",
      }}
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          {list.name}
        </Typography>
        <IconButton onClick={() => deleteList(list.id)}>
          <RxCross1 />
        </IconButton>
      </Stack>
      <Box>
        {list.points.map(({ name, id }, idx) => (
          <Box key={id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                flexGrow: 1,
                color: "text.secondary",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedCardID(id);
                setSelectedPoint(name);
              }}
            >
              {name}
            </Typography>
            <IconButton
              onClick={() => deletePoint(list.id, id)}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>

      {isAddingPoint[list.id] ? (
        <Box sx={{ mt: 2 }}>
          <TextField
            label="New Point"
            value={newPoint}
            onChange={(e) => setNewPoint(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="success"
            onClick={() => addPoint(list.id)}
            sx={{ mt: 1 }}
          >
            Add Point
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsAddingPoint({ [list.id]: true })}
          >
            Add Point
          </Button>
        </Box>
      )}

     
      {selectedPoint && (
        <ChecklistModal
          point={selectedPoint}
          cardId={selectedCardID}
          onClose={() => setSelectedPoint(null)}
        />
      )}
    </Card>
  );
};

export default PointCard;
