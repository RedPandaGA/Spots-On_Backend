const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;


// In-memory storage for user data (replace with a real database)
const users = [
  {
    username: 'testuser',
    password: 'password123', // Store passwords securely in production
  },
  // Add more user objects here
];

let authenticatedUser = null; // Temporary storage for authenticated user (not recommended for production)

app.use(bodyParser.json());

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Simulate user authentication
  const user = users.find((user) => user.username === username && user.password === password);

  if (user) {
    // Store the authenticated user in a local variable (for testing only)
    authenticatedUser = user;

    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid login credentials' });
  }
});

app.get('/api/user-data', (req, res) => {
  if (authenticatedUser) {
    res.status(200).json({ username: authenticatedUser.username });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// Middleware for parsing JSON data
app.use(bodyParser.json());

// Initialize an empty variable to store the event data
let events = [];

// Define a route to handle the POST request to store an event
app.post('/api/events', (req, res) => {
  const event = req.body;

  // Add the received event data to the events array
  events.push(event);

  res.status(201).json({ message: 'Event created successfully' });
});

// Define a route to retrieve all stored events
app.get('/api/events', (req, res) => {
  res.json(events);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


let colonies = [];

app.post('/createColony', (req, res) => {
    const { colonyName, isPrivateColony } = req.body;

    // Here you can perform additional validation or processing as needed

    const newColony = {
        colonyName,
        isPrivateColony,
        // Add other properties as needed
    };

    colonies.push(newColony);

    res.status(201).json({ message: 'Colony created successfully', colony: newColony });
});

app.get('/colonies', (req, res) => {
    res.status(200).json({ colonies });
});


module.exports = router;