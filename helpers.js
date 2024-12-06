const userUrlsCheck = (id,database) => { // returns an object with id objects from database if the userID and argument id match
  const result = {};
  for (const shortId in database) {
    const idInfo = database[shortId];
    if(idInfo.userID === id) {
      result[shortId] = idInfo;
    }
  }
  return result;
}

const accountExistCheck = (obj,database) => { // returns matching object email value or returns false if no object match argument
  for (const account in database) {
    const user = database[account];
    if (user.email === obj.email) {
      return user.id;
    }
  }
  return false;
};

const generateRandomString = () => Math.random().toString(36).slice(6); // creates random alpha numeric string by doing the following:
//math.random provides random values for a deciaml number ex. 0.12345
//toString converts data type to string and uses basecase of 36 to include values of hexadecimal letter values
//slice removes beginning half of value to return a randomized 6 character str of letters/numbers for unique ids
//thank you for the idea Andy!

module.exports = {userUrlsCheck,accountExistCheck,generateRandomString};