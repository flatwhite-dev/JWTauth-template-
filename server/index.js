require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const router = require("./routes/index");
const errorMiddleware = require("./middlewares/error-middleware");

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api", router);

app.use(errorMiddleware);

const port = process.env.SERVER_PORT || 1111;
const db_url = process.env.DB_URL;

const start = async () => {
  try {
    await mongoose
      .connect(db_url)

      .catch((e) => {
        console.log(e.message);
      });
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (e) {
    console.log(e);
  }
};

start();
