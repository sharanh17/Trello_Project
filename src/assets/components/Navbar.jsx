import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  TextField,
  Box,
} from "@mui/material";
import Image from "../../assets/images/image.png";

const Navbar = () => {
  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={Image} alt="Logo" style={{ height: 40, marginRight: 10 }} />
          <Typography variant="h4" sx={{ color: "white" }}>
            Trello
          </Typography>
        </Box>


        <TextField
          label="Search"
          variant="outlined"
          size="small"
          sx={{ width: 300, backgroundColor: "white", borderRadius: 2 }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
