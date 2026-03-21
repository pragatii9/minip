const express = require("express");
const cors = require("cors");

const certificateRoutes = require("./src/routes/certificateRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", certificateRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});