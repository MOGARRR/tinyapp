const { assert } = require('chai');
const { accountExistCheck } = require('../helpers');

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
