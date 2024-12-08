const {accountExistCheck,userUrlsCheck,generateRandomString} = require('./helpers');
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const salt = 10;
const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys:['cookieJar']
})); // helps read values from cookies
app.use(morgan('dev')); // console logs requests and status codes from server
app.set('view engine','ejs'); // Sets out default engine to ejs
app.use(express.urlencoded({extended:true})); // creates and fills req.body
app.use(methodOverride('_method'));

// url database
const urlDatabase = { // temporary contains seeds for development
  b2xVn2: {
    longURL:"http://www.lighthouselabs.ca",
    userID: 'user1',
    urlVisits: 0
  },
  "9sm5xK": {
    longURL:"http://www.google.com",
    userID : 'user1',
    urlVisits: 0
  },
};
// user database
const users = { // temporary contains seeds for development
  user1 : {
    id: 'user1',
    email: 'e@mail.com',
    password: bcrypt.hashSync('hippo', salt)
  }
};


app.listen(PORT, () => {
  console.log(`Starting sever on port ${PORT}`); // start server and which port
});

// GET ROUTES //

app.get('/urls', (req,res) => { // GET / URLS : renders index page
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const userURLs = userUrlsCheck(req.session.user_id, urlDatabase);
    const templateVars = {urls:userURLs, users , userCookie: req.session.user_id};
    res.render('urls_index',templateVars);
  }
});

app.get('/urls/new', (req,res) => { // GET / URLS / NEW : renders urls_new page
  const templateVars = {users, userCookie: req.session.user_id};
  req.session.user_id ? res.render('urls_new', templateVars) : res.redirect('/login');
});

app.get('/u/:id', (req,res) => {// GET / U / :ID : sends users to url or if url is not in database sends html message
  const id = req.params.id;

  if(urlDatabase[id]){
    const longURL = urlDatabase[id].longURL;
    urlDatabase[id].urlVisits ++;
    console.log(urlDatabase[id]);
    res.redirect(longURL);
  } else {
    res.status(400).send('Cannot find URL');
  }  
});

app.get('/register', (req,res) => { // GET / REGISTER : renders register page
  const templateVars = {users, userCookie: req.session.user_id};
  req.session.user_id ? res.redirect('/urls') : res.render('register',templateVars); // redirects to /urls if logged in and renders register page if not
});

app.get('/login', (req,res) => { // GET / LOGIN : render login page
  const templateVars = {users, userCookie: req.session.user_id};
  req.session.user_id ? res.redirect('/urls') : res.render('login',templateVars); // redirects to /urls if logged in and renders login page if not
});

app.get('/urls/:id', (req,res) => { // GET / URLS / :ID : a catch all that renders a page for url in database or returns html error message
  const userURLs = userUrlsCheck(req.session.user_id, urlDatabase);
  if (!userURLs[req.params.id]) {
    res.status(400).send('Error: You dont own this url');
  } else {
    const templateVars = { id: req.params.id, url: urlDatabase[req.params.id], users, userCookie: req.session.user_id};
    urlDatabase[req.params.id] ? res.render('urls_show', templateVars) : res.status(400).send('Error: Cannot find url');
  }
});
 
// DELETE/PUT ROUTES //
app.delete('/urls/:id', (req,res) => { // POST / URLS / :ID / DELETE : deletes request id from url database
  const userURLs = userUrlsCheck(req.session.user_id, urlDatabase);
  const id = req.params.id;
  if (!userURLs[id]) {
    res.status(400).send('Error: You dont own this url');
  } else {
    delete urlDatabase[id];
    res.redirect('/urls');
  }
});

app.put('/urls/:id', (req,res) => { // POST / URLS / :ID / EDIT : changes long url value of id and updates url database
  const userUrls = userUrlsCheck(req.session.user_id, urlDatabase);
  const id = req.params.id;
  const newURL = req.body.longURL;

  if (!userUrls[id]){
    res.status(400).send('Error: You dont own this url');
  } else if (newURL === '') {
    res.status(400).send('Error: Cannot leave url empty');
  } else {
    urlDatabase[id].longURL = newURL;
    res.redirect('/urls');
  }
});

// POST ROUTES //

app.post('/urls', (req,res) => { // POST / URLS : creates urls and updates url database
  if (!req.session.user_id) { 
    res.end('Please log into account to use features'); // sends html response if POST request is made while not logged in
  } else { 
    const id = generateRandomString(); // make random url id
    const url = req.body.longURL; // get url from parsed data from post
    urlDatabase[id] = {longURL: url , userID: req.session.user_id, urlVisits: 0};
    res.redirect(`/urls/${id}`);
  }
});

app.post('/logout', (req,res) => { // POST / LOGOUT : clears user_id cookie when user logs out
  req.session = null;
  res.redirect('/login');
});


app.post('/register', (req,res) => { // POST / REGISTER : if no errors will update users database with new user from request info and cookie with id
  const newID = generateRandomString(); // random str for new id
  const newUser = {id: newID, email: req.body.email, password: bcrypt.hashSync(req.body.password, salt)}; // new object with request form values and cookie/id value and adds new user object to global database
  const verifyInfo = accountExistCheck(newUser,users); // should return false to verify no account with same info exist

  if (newUser.email === '' || newUser.password === '') { // errors for empty form fields or register an existing account
    res.status(400).send('Error with registering: Please fill in the fields');
  } else if (verifyInfo !== false) {
    res.status(400).send('Error with registering: Account already exist');
  } else {
    req.session.user_id = newID; // create cookie with id value
    users[newID] = newUser; // add new user to users database
    res.redirect('/urls');
  }
});

app.post('/login', (req,res) => { // POST / LOGIN : if no errors will update user_id cookie and log user into their account
  const loginInfo = {email: req.body.email, password: req.body.password};
  const verifyInfo = accountExistCheck(loginInfo,users); //should return account id to create new user_id cookie for the user

  if (loginInfo.email === '' || loginInfo.password === '') { // errors for empty fields, account not being found, or incorrect password
    res.status(400).send('Error with login: Please fill in the fields');
  } else if (!verifyInfo) {
    res.status(400).send('Error with login: Account doesnt exist. Please try again or register a new account');
  } else if (!bcrypt.compareSync(loginInfo.password, users[verifyInfo].password)) {
    res.status(400).send('Error with login: Password is incorrect');
  } else {
    req.session.user_id = verifyInfo; // updates cookie to new account id
    res.redirect('/urls');
  }
});