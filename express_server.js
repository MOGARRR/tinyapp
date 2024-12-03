const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(cookieParser()); // helps read values from cookies
app.use(morgan('dev')); // console logs requests and status codes from server
app.set('view engine','ejs'); // Sets out default engine to ejs
app.use(express.urlencoded({extended:true})); // creates and fills req.body

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {}


app.listen(PORT, () => {
  console.log(`Example App listening on port ${PORT}`); // start server and which port
});

app.get('/urls.json', (req,res) => { // returns database json object
  res.json(urlDatabase);
});

app.get('/urls', (req,res) => { // render index page
  const templateVars = {urls:urlDatabase, users , userCookie: req.cookies['user_id']};
  res.render('urls_index',templateVars);
});

app.post('/urls', (req,res) => { // post request to add new urls to database
  const id = generateRandomString(); // make random url id
  const url = req.body.longURL; // get url from parsed data from post
  urlDatabase[id] = url;
  res.redirect(`/urls/${id}`);
});

app.get('/urls/new', (req,res) => { // renders create new url form
  const templateVars = {users, userCookie: req.cookies['user_id']};
  res.render('urls_new', templateVars);
});

app.post('/urls/:id/delete', (req,res) => { // deletes paramater id form database
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get('/u/:id', (req,res) => {// redirects to the ids longURL in the database
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post('/urls/:id/edit', (req,res) => { // changes short url values to new longUrl and updates database. redirects to index when done
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect('/urls');
});

app.get('/urls/:id', (req,res) => { // catch all get requst for urls. add url pages above
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, userCookie: req.cookies['user_id']};
  res.render('urls_show', templateVars);
});

app.post('/login', (req,res) => { // Saves username POST request as a cookie and redirects to url_index
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req,res) => { // clears username cookie and redirects to url page
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/register', (req,res) => { // renders register page templateVars for header partial
  const templateVars = {users, userCookie: req.cookies['user_id']};
  res.render('register', templateVars);
});

app.post('/register', (req,res) => { // on POST request 
  const newID = generateRandomString(); // random str for new id
  res.cookie('user_id', newID); // create cookie with id value
  const newUser = { // new object with request form values and cookie/id value
    id: newID,
    email: req.body.email,
    password: req.body.password
  };
  users[newID] = newUser; // adds new user object to global database
  res.redirect('urls'); // redirects to home url page
});

const generateRandomString = () => Math.random().toString(36).slice(6);