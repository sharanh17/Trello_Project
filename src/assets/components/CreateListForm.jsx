import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";

const CreateListForm = ({
  listTitle,
  setListTitle,
  points,
  setPoints,
  handleFormSubmit,
  setShowForm,
}) => {
  return (
    <Card sx={{ mt: 3, p: 2, boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          New List
        </Typography>
        <TextField
          label="List Title"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={listTitle}
          onChange={(e) => setListTitle(e.target.value)}
        />
        {points.map((point, index) => (
          <TextField
            key={index}
            label={`Point ${index + 1}`}
            variant="outlined"
            fullWidth
            sx={{ mb: 1 }}
            value={point}
            onChange={(e) => {
              const updatedPoints = [...points];
              updatedPoints[index] = e.target.value;
              setPoints(updatedPoints);
            }}
          />
        ))}
        <Button
          variant="text"
          color="secondary"
          onClick={() => setPoints([...points, ""])}
          sx={{ mt: 1 }}
        >
          + Add another point
        </Button>
        <Box sx={{ textAlign: "right", mt: 2 }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleFormSubmit}
          >
            Create List
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowForm(false)}
            sx={{ ml: 2 }}
          >
            Cancel
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreateListForm;
