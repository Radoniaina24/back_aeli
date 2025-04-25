const jwt = require("jsonwebtoken");
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) return false;
    return decoded;
  });
}
module.exports = verifyToken;
