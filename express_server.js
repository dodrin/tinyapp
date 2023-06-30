const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080;

//----Helper functions
function generateRandomString() {
  //generate randome a string of 6 random alphanumeric characters
  //36 represents base 36
  return Math.random().toString(36).substring(2, 8);
}

function getUserByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
}

function urlsForUser(id) {
  //returns the URLs where the userID is equal to
  //the id of the currently logged-in user.
  const userURLs = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === id) {
      userURLs[id] = urlDatabase[id];
    }
  }
  return userURLs;
}

//---Middleware
app.use(cookieParser());
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
  const loginID = req.cookies["user_id"];
  const loginUser = users[loginID];
  const templateVars = {
    user: loginUser,
    urls: urlDatabase,
    userURLs: urlsForUser(loginID),
    user_id: loginID,
  };
  if (!loginUser) {
    res
      .status(401)
      .send(
        "<h2>You must be logged in to TinyApp!</h2><p>Login or register first.</p>"
      );
  } else {
    templateVars.urls = urlsForUser(loginID);
    res.render("urls_index", templateVars);
  }
});

//POST request to add a new URL with new short URL
app.post("/urls", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    res.status(401).send("<h2>You must be logged in to TinyApp.</h2>");
  }
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const loginID = req.cookies["user_id"];
  const loginUser = users[loginID];
  const templateVars = {
    user: loginUser,
  };
  if (!loginUser) {
    res.render("login", templateVars);
  }
  res.render("urls_new", templateVars);
});

//Retrive "id" parameter from url looks up the corresponding longURL
//in the urlDatabase and then renders the urls_show
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const loginID = req.cookies["user_id"];
  const loginUser = users[loginID];
  const url = urlDatabase[id];

  if (!loginUser) {
    res
      .status(401)
      .send(
        "<h2>You must be logged in to TinyApp!</h2><p>Login or register first.</p>"
      );
  }

  if (!url) {
    res.send("<h2>Short url does not exist.</h2>");
  }

  const templateVars = {
    id: id,
    longURL: url.longURL,
    user: loginUser,
  };
  res.render("urls_show", templateVars);
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
  const newUser = {
    id: user_id,
    email: email,
    password: password,
  };
  users[user_id] = newUser;

  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]],
  };
  if (users[req.cookies["user_id"]]) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

//---Delete
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

//---Edit
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    user_id: req.cookies["user_id"],
  };
  res.redirect("/urls");
});

//---Login
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]],
  };
  if (users[req.cookies["user_id"]]) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const currentUser = getUserByEmail(email);

  if (!currentUser) {
    return res.status(403).send("Invalid email/password");
  }

  if (currentUser.password !== password) {
    return res.status(403).send("Invalid email/password");
  }
  res.cookie("user_id", currentUser.id);
  res.redirect("/urls");
});

//---Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});
