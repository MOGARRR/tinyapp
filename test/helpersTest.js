const { assert } = require('chai');
const { accountExistCheck, userUrlsCheck } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// Test cases

describe('#accountExistCheck', function() {
  it('should return a user with valid email', function() {

    const loginInfo = {email:"user@example.com"};
    const user = accountExistCheck(loginInfo, testUsers);
    const expectedUserID = "userRandomID";

    assert.strictEqual(user, expectedUserID);
    
  });

  it('should return false with invalid email', function() {

    const loginInfo = {email:"nobody@example.com"};
    const user = accountExistCheck(loginInfo, testUsers);

    assert.isFalse(user);
    
  });
});

// Test suite for userUrlsCheck
describe('userUrlsCheck', function () {
  it('should return only the URLs that belong to the specified user', function () {
    // Sample data for testing
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
    };

    const userId = "user1";
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
    };

    // Call the function
    const result = userUrlsCheck(userId, urlDatabase);

    // Assert
    assert.deepEqual(result, expectedOutput, "Returned URLs should match the expected output for the specified user");
  });

  it('should return an empty object if no URLs in the database belong to the specified user', function () {
    // Sample data for testing
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
    };

    const userId = "user3"; // A user ID not present in the database
    const expectedOutput = {}; // Expect an empty object since no URLs belong to "user3"

    // Call the function
    const result = userUrlsCheck(userId, urlDatabase);

    // Assert
    assert.deepEqual(result, expectedOutput, "The function should return an empty object when no URLs match the user ID");
  });

  it('should return an empty object if the database is empty', function () {
    // Empty database for testing
    const urlDatabase = {};

    const userId = "user1"; // Any user ID
    const expectedOutput = {}; // Expect an empty object since the database is empty

    // Call the function
    const result = userUrlsCheck(userId, urlDatabase);

    // Assert
    assert.deepEqual(result, expectedOutput, "The function should return an empty object when the database is empty");
  });
  
});