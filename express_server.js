const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080;

function generateRandomString() {
  //generate randome a string of 6 random alphanumeric characters
  //36 represents base 36
  return Math.random().toString(36).substring(2, 8);
}

function getUserByEmail(email, users) {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return undefined;
}

//middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs"); //Set ejs as the view engine

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.ca",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
    user_id: req.cookies["user_id"],
  };
  res.render("urls_index", templateVars);
});

//POST request to add a new URL with new short URL
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  const longURL = req.body.longURL;
  // const templateVars = (urlDatabase[id] = longURL);
  res.redirect(`/urls/${id}`); //It will redirect to get ('/urls/:id')
});

//New url form request from client to server
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

//Retrive "id" parameter from url looks up the corresponding longURL in
//the urlDatabase and then renders the urls_show
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = {
    id: id,
    longURL: longURL,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post("/register", (req, res) => {
  //sane as Const email = req.body.email and Const password = req.body.password
  const { email, password } = req.body; //accessing the data submitted in the req body
  const user_id = generateRandomString();
  const newUser = {
    id: user_id,
    email: email,
    password: password,
  };
  users[user_id] = newUser;
  if (email === "" || password === "") {
    res.status(400).send("Invalid email or password");
  }
  if (getUserByEmail(email, users)) {
    res.status(400).send("Email already exists");
  }
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

//Delete
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    user_id: req.cookies["user_id"],
  };
  res.redirect("/urls");
});

//Post request to login
app.post("/login", (req, res) => {
  const inputUserName = req.body.user_id;
  res.cookie("user_id", inputUserName);
  res.redirect("/urls");
});

//Post request to logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
