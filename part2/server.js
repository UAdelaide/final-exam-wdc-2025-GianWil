const express = require('express');
const path = require('path');
const app = express();

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.listen(8080, () => {
  console.log('Server running at http://localhost:8080');
});

