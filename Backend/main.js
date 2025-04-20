// Import modules
const express = require('express');
const path = require('path');
const cors = require('cors');
const port = 3000


const app = express();
const router = express.Router();

app.use(express.static(path.join(__dirname, '../Frontend/src')));
app.use(cors());
app.use(router);

app.get('/my-form', (req, res) =>{
    const {fname , lname} = req.query;
    res.send(`Form submitted by ${fname} ${lname} with ${req.method}`);
    console.log("received success");
});

// Handle invalid routes
app.use((req, res) => {
    res.status(404).send('Invalid Path');
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});