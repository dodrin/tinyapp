const express = require("express");
const app = express();
const PORT = 8080;

function generateRandomString() {
  //generate randome a string of 6 random alphanumeric characters
  //36 represents base 36
  return Math.random().toString(36).substring(2, 8);
}

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs"); //Set ejs as the view engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.ca",
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Define route with express
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//list all the urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//POST request to add a new URL with new short URL
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);  //It will redirect to get ('/urls/:id')
});

//New url form request from client to server
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

//Delete 
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  res.redirect("/urls");
});
