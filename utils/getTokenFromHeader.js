function getTokenFromHeader(req) {
  // Vérifiez d'abord les en-têtes
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  // Vérifiez ensuite les cookies
  const token = req.cookies?.refreshToken;
  if (token) {
    return token;
  }
  return null;
}
module.exports = getTokenFromHeader;
