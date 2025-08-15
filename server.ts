const express = require("express");
const epcRouter = require("./epc"); // path to the file above

const app = express();
app.use(express.json());

// Add EPC endpoint
app.use("/", epcRouter);

app.get("/", (req, res) => {
  res.send("Service is running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
});
