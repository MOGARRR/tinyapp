const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8081;

app.use(cookieParser()); // helps read values from cookies
app.use(morgan('dev')); // console logs requests and status codes from server
app.set('view engine','ejs'); // Sets out default engine to ejs
app.use(express.urlencoded({extended:true})); // creates and fills req.body

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


app.listen(PORT, () => {
  console.log(`Example App listening on port ${PORT}`); // start server and which port
});

app.get('/urls.json', (req,res) => { // returns database json object
  res.json(urlDatabase);
});

app.get('/urls', (req,res) => { // render index page
  const templateVars = {urls:urlDatabase, username: req.cookies['username']};
  res.render('urls_index',templateVars);
});

app.post('/urls', (req,res) => { // post request to add new urls to database
  const id = generateRandomString(); // make random url id
  const url = req.body.longURL; // get url from parsed data from post
  urlDatabase[id] = url;
  res.redirect(`/urls/${id}`);
});

app.get('/urls/new', (req,res) => { // renders create new url form
  const templateVars = {username: req.cookies['username']};
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies['username']};
  res.render('urls_show', templateVars);
});

app.post('/login', (req,res) => { // Saves username POST request as a cookie and redirects to url_index
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req,res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});
const generateRandomString = () => Math.random().toString(36).slice(6);