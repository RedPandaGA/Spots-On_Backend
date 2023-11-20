const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// user account info page
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // The folder where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Middleware to parse JSON
app.use(bodyParser.json());

// Sample in-memory user data store
const users = [];

// POST endpoint to store user data
app.post('/users', upload.single('profilePicture'), (req, res) => {
  // Extract data from the request body
  const { phoneNumber, email, password, profilePicture } = req.body;

  // Create a new user object
  const newUser = {
    phoneNumber,
    email,
    password,
    profilePicture: req.file ? req.file.filename : null, // File upload, if a profile picture is provided
  };

  // Store the user in the data store
  users.push(newUser);

  // Respond with the newly created user
  res.status(201).json(newUser);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
