const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if the username exists in your database and fetch the stored hashed password.
  // Compare the hashed password with the provided password using bcrypt.
  // If they match, the login is successful.

  if (usernameExists && bcrypt.compare(password, storedHashedPassword)) {
    // Successful login
    res.status(200).json({ message: 'Login successful' });
  } else {
    // Invalid login
    res.status(401).json({ message: 'Invalid login credentials' });
  }
});

module.exports = router;