const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
} = require("./helpers");
const app = express();
const PORT = 8080;

//---Middleware
app.use(
  cookieSession({
    name: "session",
    keys: ["secret-key"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs"); //Set ejs as the view engine

//---Datas
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i34or8: {
    longURL: "https://github.com/",
    userID: "asdfg",
  },
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
  asdfg: {
    id: "asdfg",
    email: "asd@fg",
    password: "kuma",
  },
};

//---Routes
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Define route with express
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//list all the urls
app.get("/urls", (req, res) => {
  const loginID = req.session.user_id;
  const loginUser = users[loginID];
  const templateVars = {
    user: loginUser,
    urls: urlDatabase,
    userURLs: urlsForUser(loginID, urlDatabase),
    user_id: loginID,
  };
  if (!loginUser) {
    res
      .status(401)
      .send(
        "<h2>You must be logged in to TinyApp!</h2><p>Login or register first.</p>"
      );
  } else {
    templateVars.urls = urlsForUser(loginID, urlDatabase);
    res.render("urls_index", templateVars);
  }
});

//POST request to add a new URL with new short URL
app.post("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.status(401).send("<h2>You must be logged in to TinyApp.</h2>");
  }
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const loginID = req.session.user_id;
  const loginUser = users[loginID];
  const templateVars = {
    user: loginUser,
  };
  if (!loginUser) {
    return res.render("login", templateVars);
  }
  res.render("urls_new", templateVars);
});

//Retrive "id" parameter from url looks up the corresponding longURL
//in the urlDatabase and then renders the urls_show
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const loginID = req.session.user_id;
  const loginUser = users[loginID];
  const url = urlDatabase[id];

  if (!url) {
    return res.send("<h2>Short url does not exist.</h2>");
  }

  if (!loginUser) {
    return res
      .status(401)
      .send(
        "<h2>You must be logged in to TinyApp!</h2><p>Login or register first.</p>"
      );
  }

  if (url.userID !== loginID) {
    return res.send("<h2>You do not have permission to access this URL.</h2>");
  }

  const templateVars = {
    id: id,
    longURL: url.longURL,
    user: loginUser,
  };
  res.render("urls_show", templateVars);
});

//---Delete
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const loginID = req.session.user_id;
  const loginUser = users[loginID];
  const url = urlDatabase[id];

  if (!url) {
    return res.send("<h2>Short url does not exist.</h2>");
  }

  if (!loginUser) {
    return res
      .status(401)
      .send(
        "<h2>You must be logged in to TinyApp!</h2><p>Login or register first.</p>"
      );
  }

  if (url.userID !== loginID) {
    return res.send("<h2>You do not have permission to access this URL.</h2>");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

//---Edit
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const loginID = req.session.user_id;
  const loginUser = users[loginID];
  const url = urlDatabase[id];

  if (!url) {
    return res.send("<h2>Short url does not exist.</h2>");
  }

  if (!loginUser) {
    return res
      .status(401)
      .send(
        "<h2>You must be logged in to TinyApp!</h2><p>Login or register first.</p>"
      );
  }

  if (url.userID !== loginID) {
    return res.send("<h2>You do not have permission to access this URL.</h2>");
  }

  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

//---Register
app.post("/register", (req, res) => {
  //same as Const email = req.body.email and Const password = req.body.password
  const { email, password } = req.body; //accessing the data submitted in the req body

  if (!email || !password) {
    return res.status(400).send("Invalid email or/and password");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already exists");
  }

  const user_id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: user_id,
    email: email,
    password: hashedPassword,
  };
  users[user_id] = newUser;

  req.session.user_id = user_id;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const loginID = req.session.user_id;
  const loginUser = users[loginID];

  const templateVars = {
    user_id: loginID,
    user: loginUser,
  };
  if (loginUser) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

//---Login
app.get("/login", (req, res) => {
  const loginID = req.session.user_id;
  const loginUser = users[loginID];

  const templateVars = {
    user_id: loginID,
    user: loginUser,
  };
  if (loginUser) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const currentUser = getUserByEmail(email, users);

  if (!currentUser) {
    return res.status(403).send("Invalid email/password");
  }

  const passwordMatch = bcrypt.compareSync(password, currentUser.password);

  if (!passwordMatch) {
    return res.status(403).send("Invalid email/password");
  }
  req.session.user_id = currentUser.id;
  res.redirect("/urls");
});

//---Logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});
