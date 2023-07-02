/**
 * Get user by Email from user database
 * @param {string} email
 * @returns user information object if found, otherwise undefined
 */
function getUserByEmail(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
}

/**
 * Only shows URLs that belong to the logged-in user from urlDatabase
 * @param {string} id - the id of the currently logged-in user
 * @Returns the URLs where the userID is equal to
 */
function urlsForUser(id, urlDatabase) {
  const userURLs = {};
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      userURLs[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return userURLs;
}

/**
 * @Returns a string of 6 random alphanumeric characters
 */
function generateRandomString() {
  //36 represents base 36
  return Math.random().toString(36).substring(2, 8);
}

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
};
