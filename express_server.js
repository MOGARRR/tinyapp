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
const users = {
  user1 : {
    id: 'user1',
    email: 'e@mail.com',
    password:'hippo'
  }
};


app.listen(PORT, () => {
  console.log(`Example App listening on port ${PORT}`); // start server and which port
});

app.get('/urls', (req,res) => { // GET / URLS : renders index page
  const templateVars = {urls:urlDatabase, users , userCookie: req.cookies['user_id']};
  res.render('urls_index',templateVars);
});

app.post('/urls', (req,res) => { // POST / URLS : creates urls and updates url database
  const id = generateRandomString(); // make random url id
  const url = req.body.longURL; // get url from parsed data from post
  urlDatabase[id] = url;
  res.redirect(`/urls/${id}`);
});

app.get('/urls/new', (req,res) => { // GET / URLS / NEW : renders urls_new page
  const templateVars = {users, userCookie: req.cookies['user_id']};
  res.render('urls_new', templateVars);
});

app.post('/urls/:id/delete', (req,res) => { // POST / URLS / :ID / DELETE : deletes request id from url database
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get('/u/:id', (req,res) => {// GET / U / :ID : adds long url to url database
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post('/urls/:id/edit', (req,res) => { // POST / URLS / :ID / EDIT : changes long url value of id and updates url database
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect('/urls');
});

app.get('/urls/:id', (req,res) => { // GET / URLS / :ID : a catch all that renders a page for any url id given
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], users, userCookie: req.cookies['user_id']};
  res.render('urls_show', templateVars);
});

app.post('/logout', (req,res) => { // POST / LOGOUT : clears user_id cookie when user logs out
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get('/register', (req,res) => { // GET / REGISTER : renders register page
  const templateVars = {users, userCookie: req.cookies['user_id']};
  req.cookies['user_id'] ? res.redirect('/urls') : res.render('register',templateVars); // redirects to /urls if logged in and renders register page if not
});

app.post('/register', (req,res) => { // POST / REGISTER : if no errors will update users database with new user from request info and cookie with id
  const newID = generateRandomString(); // random str for new id
  const newUser = {id: newID, email: req.body.email, password: req.body.password}; // new object with request form values and cookie/id value and adds new user object to global database
  const verifyInfo = accountExistCheck(newUser); // should return false to verify no account with same info exist

  if (newUser.email === '' || newUser.password === '') { // errors for empty form fields or register an existing account
    res.status(400).send('Error with registering: Please fill in the fields');
  } else if (verifyInfo !== false) {
    res.status(400).send('Error with registering: Account already exist');
  } else {
    res.cookie('user_id', newID); // create cookie with id value
    users[newID] = newUser; // add new user to users database
    res.redirect('/urls');
  }
});

app.get('/login', (req,res) => { // GET / LOGIN : render login page
  const templateVars = {users, userCookie: req.cookies['user_id']};
  req.cookies['user_id'] ? res.redirect('/urls') && console.log(req.signedCookies['user_id']) : res.render('login',templateVars); // redirects to /urls if logged in and renders login page if not
});

app.post('/login', (req,res) => { // POST / LOGIN : if no errors will update user_id cookie and log user into their account
  const loginInfo = {email: req.body.email, password: req.body.password};
  const verifyInfo = accountExistCheck(loginInfo); //should return account id to create new user_id cookie for the user

  if (loginInfo.email === '' || loginInfo.password === '') { // errors for empty fields, account not being found, or incorrect password
    res.status(400).send('Error with login: Please fill in the fields');
  } else if (!verifyInfo) {
    res.status(400).send('Error with login: Account doesnt exist. Please try again or register a new account');
  } else if (users[verifyInfo].password !== loginInfo.password) {
    res.status(400).send('Error with login: Password is incorrect');
  } else {
    res.cookie('user_id', verifyInfo); // updates cookie to new account id
    res.redirect('/urls');
  }
});


const accountExistCheck = (obj) => { // returns matching object email value or returns false if no object match argument
  for (const account in users) {
    const user = users[account];
    if (user.email === obj.email) {
      return user.id;
    }
  }
  return false;
};


const generateRandomString = () => Math.random().toString(36).slice(6); // creates random alpha numeric string by doing the following:
//math.random provides random values for a deciaml number ex. 0.12345
//toString converts data type to string and uses basecase of 36 to include values of hexadecimal letter values
//slice removes beginning half of value to return a randomized 6 character str of letters/numbers for unique ids
//thank you for the idea Andy!