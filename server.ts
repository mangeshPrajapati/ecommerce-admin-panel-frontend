const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "dist/app-test")));

// Handle all other routes by serving the index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/app-test/index.html"));
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
