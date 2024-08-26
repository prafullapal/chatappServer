require("dotenv").config();
const app = require("./express");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error: ")
);
mongoose.connection.once("open", function () {
  console.log("Connected successfully");
});

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.info("Server started on port %s.", process.env.PORT);
});
