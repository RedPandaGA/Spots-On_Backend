var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;
const jwt = require("jsonwebtoken");

const bcrypt = require('bcrypt'); 

const { userID, password, phoneNumber } = req.body;

// Check if email, password, and phone number are present in the request body
if (!userID || !password || !phoneNumber) {
  return res.status(400).json({ message: "userID, password, and phone number are required." });
}

// Hash the password before storing it
const hashedPassword = bcrypt.hashSync(password, 10);

// Your JWT_SECRET should still be retrieved from the environment variable
const JWT_SECRET = process.env.JWT_SECRET;

// Create a payload with email, hashed password, and phone number
const payload = {
  userID,
  password: hashedPassword,
  phoneNumber
};

// Sign the token with the payload and secret
const token = jwt.sign(payload, JWT_SECRET);

return res.status(200).json({ message: "User Logged in Successfully", token });







// // user account info page
// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // The folder where uploaded files will be stored
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// // Middleware to parse JSON
// app.use(bodyParser.json());

// // Sample in-memory user data store
// const users = [];

// // POST endpoint to store user data
// app.post('/users', upload.single('profilePicture'), (req, res) => {
//   // Extract data from the request body
//   const { name, phoneNumber, email, password, blockedUsers, premiumStatus } = req.body;

//   // Create a new user object
//   const newUser = {
//     name,
//     phoneNumber,
//     email,
//     password,
//     blockedUsers: blockedUsers || [], // Default to an empty array if not provided
//     premiumStatus: premiumStatus || false, // Default to false if not provided
//     profilePicture: req.file ? req.file.filename : null, // File upload, if a profile picture is provided
//   };

//   // Store the user in the data store
//   users.push(newUser);

//   // Respond with the newly created user
//   res.status(201).json(newUser);
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

module.exports = router;
