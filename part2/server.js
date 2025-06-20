const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Part 2 server is running');
});

app.listen(8080, () => {
  console.log('Server listening on port 8080');
});
