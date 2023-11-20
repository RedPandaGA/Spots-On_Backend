var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
var multer = require('multer');
var upload = multer(); 
var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require("cors");


app.set('view engine', 'pug');
app.set('views','./views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "Your secret key"}));

var Users = [];

app.get('/signup', function(req, res){
   res.render('signup');
});

app.post('/signup', function(req, res){
   if(!req.body.id || !req.body.password){
      res.status("400");
      res.send("Invalid details!");
   } else {
      Users.filter(function(user){
         if(user.id === req.body.id){
            res.render('signup', {
               message: "User Already Exists! Login or choose another user id"});
         }
      });
      var newUser = {id: req.body.id, password: req.body.password};
      Users.push(newUser);
      req.session.user = newUser;
      res.redirect('/protected_page');
   }
});
function checkSignIn(req, res){
   if(req.session.user){
      next();     //If session exists, proceed to page
   } else {
      var err = new Error("Not logged in!");
      console.log(req.session.user);
      next(err);  //Error, trying to access unauthorized page!
   }
}


app.get('/protected_page', checkSignIn, function(req, res){
   res.render('protected_page', {id: req.session.user.id})
});

app.get('/login', function(req, res){
   res.render('login');
});

app.post('/login', function(req, res){
   console.log(Users);
   if(!req.body.id || !req.body.password){
      res.render('login', {message: "Please enter both id and password"});
   } else {
      Users.filter(function(user){
         if(user.id === req.body.id && user.password === req.body.password){
            req.session.user = user;
            res.redirect('/protected_page');
         }
      });
      res.render('login', {message: "Invalid credentials!"});
   }
});

app.get('/logout', function(req, res){
   req.session.destroy(function(){
      console.log("user logged out.")
   });
   res.redirect('/login');
});

app.use('/protected_page', function(err, req, res, next){
console.log(err);
   //User should be authenticated! Redirect him to log in.
   res.redirect('/login');
});

app.listen(3000);

//
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



app.get('/colonies', (req, res) => {
    res.status(200).json({ colonies });
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
