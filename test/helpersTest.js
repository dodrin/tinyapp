const { assert } = require("chai");

const { getUserByEmail } = require("../helpers");

const testUsers = {
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

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it("should return undefined with invalid email", function () {
    const result = getUserByEmail("invalid@email");
    assert.strictEqual(result, undefined);
  });

  it("should return undefined with empty string", function () {
    const result = getUserByEmail();
    assert.strictEqual(result, undefined);
  });
});
