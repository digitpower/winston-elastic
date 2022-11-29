const express = require("express");
const logger = require("./logging/log");

const PORT = "3000";
const app = express();

app.get("/", (req, res) => {
  res.json({ msg: `response from port ${PORT}` });
});

app.get("/log", (req, res) => {
  logger.error("another message", { name: "tahsin" }, req);
  res.json({ msg: "logging endpoint" });
});

app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});
