require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");

const cors = require("cors");

const {
  errorResponse,
  notFoundHandler,
  globalErrorHandler,
} = require("./helpers/responseHandler");

const router = require("./routes");

const app = express();

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());

// mount routes
app.use("/", router);

// 404 and other custom error handler
app.use(notFoundHandler);

app.use(globalErrorHandler);

module.exports = app;
