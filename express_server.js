const express = require('express');
const app = express();
const PORT = 8081;

app.set('view engine','ejs'); // Sets out default engine to ejs
app.use(express.urlencoded({extended:true})); // translates post request body so we can use it

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get('/', (req,res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Example App listening on port ${PORT}`);
});

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req,res) => {
  const templateVars = {urls:urlDatabase};
  res.render('urls_index',templateVars);
});

app.post('/urls', (req,res) => {
  console.log(req.body);
  res.send('ok');
});

app.get('/urls/new', (req,res) => {
  res.render('urls_new');
});


app.get('/urls/:id', (req,res) => { // catch all get requst for urls. add url pages above
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show',templateVars);
});

const generateRandomString = () => Math.random.toString(36).slice(2);