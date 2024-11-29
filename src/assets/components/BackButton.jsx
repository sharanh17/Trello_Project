import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <Button variant="outlined" onClick={() => navigate("/")} sx={{ mr: 2 }}>
      Back to Boards
    </Button>
  );
};

export default BackButton;
