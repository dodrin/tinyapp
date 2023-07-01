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

module.exports = getUserByEmail;