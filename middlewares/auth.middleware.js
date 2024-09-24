const Token = require("../models/token.model");
const { isTokenValid, attachTokensToCookies } = require("../utils/jwt");

const authenticateUser = async (req, res, next) => {
  try {
    // Extract tokens from cookies
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    let payload;

    // Check if accessToken is present and valid
    if (accessToken) {
      try {
        payload = isTokenValid(accessToken); // Validate the access token
        req.user = payload.user;
        return next(); // User is authenticated, proceed
      } catch (err) {
        console.log("Invalid access token, checking refresh token...");
      }
    }

    // If accessToken is invalid or absent, check refreshToken
    if (refreshToken) {
      payload = isTokenValid(refreshToken); // Validate the refresh token

      const existingToken = await Token.findOne({
        userId: payload.user.userId,
        refreshToken: payload.refreshToken,
      });

      if (!existingToken || !existingToken.isValid) {
        return next({
          status: 403,
          message: "Authentication Failed: Invalid refresh token",
        });
      }

      // Re-issue new tokens and set them in cookies
      attachTokensToCookies({
        res,
        user: payload.user,
        refreshToken: existingToken.refreshToken,
      });
      req.user = payload.user;
      return next(); // User is authenticated, proceed
    }

    // If no tokens are valid or present
    return next({
      status: 403,
      message: "Authentication Invalid: No valid token provided",
    });
  } catch (error) {
    return next({
      status: 403,
      message: "Authentication Invalid",
    });
  }
};

module.exports = {
  authenticateUser,
};
