const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const createJWT = ({ payload, expiresIn }) => {
  try {
    const token = jwt.sign(payload, process.env.JWT_KEY, {
      expiresIn,
    });
    return token;
  } catch (error) {
    throw new Error("Error creating JWT");
  }
};

const isTokenValid = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
};

const attachTokensToCookies = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user }, expiresIn: "15m" }); // 15 minutes
  const refreshTokenJWT = createJWT({
    payload: { user, refreshToken },
    expiresIn: "30d",
  }); // 30 days

  // Set tokens in cookies
  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

const createTokenUser = (user) => {
  return {
    name: user.name,
    userId: user._id,
    email: user.email,
  };
};

const hashString = (string) =>
  crypto.createHash("sha256").update(string).digest("hex");

const generateTempToken = (payload) => {
  const secretKey = process.env.JWT_KEY;
  const options = {
    expiresIn: "15m", // Token is valid for 15 minutes
  };

  // Generate a JWT token with the payload (e.g., email)
  const token = jwt.sign(payload, secretKey, options);
  return token;
};

module.exports = {
  createJWT,
  isTokenValid,
  attachTokensToCookies,
  createTokenUser,
  hashString,
  generateTempToken,
};
