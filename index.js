const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();

app.use(cors());

dotenv.config();

const authRoutes = require("./routes/auth");

const connectDB = () => {
  mongoose
    .connect(process.env.MONGO)
    .then(() => console.log("Database connected"))
    .catch((error) => console.log(error));
};

app.use(express.json());

app.use("/ardilla/api/auth", authRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

const port = process.env.PORT || 6000;

app.listen(port, () => {
  connectDB();
  console.log(`Server works on ${port}`);
});
