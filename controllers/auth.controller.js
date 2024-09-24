const User = require("../models/user.model");
const Token = require("../models/token.model");
const OTP = require("../models/otp.model");
const crypto = require("crypto");

const {
  createTokenUser,
  attachTokensToCookies, // Updated to save tokens in cookies
  generateTempToken,
  isTokenValid,
} = require("../utils/jwt");

const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../utils/mailService");

const generateFourDigitOTP = require("../utils/otpGenerator");

const { successResponse } = require("../helpers/responseHandler");

const register = async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) {
      return next({
        status: 400,
        message: "Please provide email and password",
      });
    }

    if (password !== confirmPassword) {
      return next({
        status: 400,
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return next({
          status: 400,
          message: "Email already exists",
        });
      } else {
        let otp = await OTP.findOne({ userId: existingUser._id });
        const currentTime = new Date();

        if (otp && otp.expiresAt > currentTime) {
          await sendVerificationEmail({
            email: existingUser.email,
            verificationOTP: otp.otpCode,
            host: req.headers.host.toString(),
          });
        } else {
          const verificationOTP = generateFourDigitOTP();
          if (otp) await OTP.deleteOne({ userId: existingUser._id });
          otp = await OTP.create({
            userId: existingUser._id,
            otpCode: verificationOTP,
            expiresAt: new Date(currentTime.getTime() + 30 * 60 * 1000),
          });
          await sendVerificationEmail({
            email: existingUser.email,
            verificationOTP: otp.otpCode,
            host: req.headers.host.toString(),
          });
        }

        return successResponse(
          res,
          { email: existingUser.email },
          "Verification email sent to existing unverified user"
        );
      }
    }

    const user = await User.create({ email, password });
    const verificationOTP = generateFourDigitOTP();
    const currentTime = new Date();
    await OTP.create({
      userId: user._id,
      otpCode: verificationOTP,
      expiresAt: new Date(currentTime.getTime() + 30 * 60 * 1000),
    });
    await sendVerificationEmail({
      email: user.email,
      verificationOTP: verificationOTP,
      host: req.headers.host.toString(),
    });

    return successResponse(
      res,
      { email: user.email },
      "User created successfully!"
    );
  } catch (err) {
    return next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next({
        status: 400,
        message: "Email and OTP both are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next({
        status: 400,
        message: "User doesn't exist!",
      });
    }

    const existingOtp = await OTP.findOne({ userId: user._id });

    if (!existingOtp) {
      return next({
        status: 400,
        message: "Invalid OTP",
      });
    }

    if (existingOtp.otpCode !== otp || existingOtp.expiresAt < new Date()) {
      return next({
        status: 400,
        message: "Invalid or expired OTP",
      });
    }

    await User.updateOne({ email }, { isVerified: true });
    await OTP.deleteOne({ userId: user._id });

    return successResponse(res, null, "Email verified successfully!");
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next({
        status: 400,
        message: "Please provide all values",
      });
    }

    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return next({
        status: 401,
        message: "Invalid Credentials",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    console.log(isPasswordCorrect);

    if (!isPasswordCorrect) {
      return next({
        status: 401,
        message: "Invalid Credentials",
      });
    }

    if (!user.isVerified) {
      return next({
        status: 403,
        message: "Please verify your email",
      });
    }

    const tokenUser = createTokenUser(user);
    let refreshToken;
    const existingToken = await Token.findOne({ userId: user._id });

    if (existingToken) {
      if (!existingToken.isValid) {
        console.log("Invalid token, generating new one...");
      }

      refreshToken = crypto.randomBytes(40).toString("hex");
      const userAgent = req.headers["user-agent"];
      const ip = req.ip;
      existingToken.refreshToken = refreshToken;
      existingToken.expiresAt = new Date(
        new Date().getTime() + 30 * 24 * 60 * 60 * 1000
      );
      existingToken.isValid = true;
      existingToken.ip = ip;
      existingToken.userAgent = userAgent;
      await existingToken.save();

      attachTokensToCookies({ res, user: tokenUser, refreshToken });

      return successResponse(
        res,
        {
          email: user.email,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          image: user?.image || "",
          color: user?.color || "",
          profileSetup: user.profileSetup,
        },
        "Login Success"
      );
    }

    refreshToken = crypto.randomBytes(40).toString("hex");
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    const userToken = {
      refreshToken,
      ip,
      userAgent,
      userId: user._id,
      expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
    };

    await Token.create(userToken);

    attachTokensToCookies({ res, user: tokenUser, refreshToken });
    return successResponse(
      res,
      {
        email: user.email,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        image: user?.image || "",
        color: user?.color || "",
        profileSetup: user.profileSetup,
      },
      "Login Success"
    );
  } catch (err) {
    return next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next({
        status: 400,
        message: "No refresh token provided",
      });
    }

    payload = isTokenValid(refreshToken);
    const token = await Token.findOne({
      userId: req.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!token) {
      return next({
        status: 404,
        message: "Invalid refresh token",
      });
    }

    token.isValid = false;
    await token.save();

    // Clear cookies on logout
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return successResponse(res, null, "Logged out successfully");
  } catch (err) {
    return next(err);
  }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return next({
        status: 400,
        message: "Please provide an email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next({
        status: 400,
        message: "User with this email does not exist",
      });
    }

    const existingOtp = await OTP.findOne({ userId: user._id });
    const currentTime = new Date();

    if (existingOtp && existingOtp.expiresAt > currentTime) {
      await sendResetPasswordEmail({
        email: user.email,
        otp: existingOtp.otpCode,
      });
    } else {
      const otp = generateFourDigitOTP();
      if (existingOtp) await OTP.deleteOne({ userId: user._id });
      await OTP.create({
        userId: user._id,
        otpCode: otp,
        expiresAt: new Date(currentTime.getTime() + 30 * 60 * 1000),
      });
      await sendResetPasswordEmail({
        email: user.email,
        otp: otp,
      });
    }

    return successResponse(res, { email: user.email }, "OTP sent to email");
  } catch (err) {
    next(err);
  }
};

const verifyResetPasswordOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.query;

    if (!email || !otp) {
      return next({
        status: 400,
        message: "Please provide email and OTP",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next({
        status: 400,
        message: "Invalid email",
      });
    }

    const otpRecord = await OTP.findOne({ userId: user._id, otpCode: otp });

    if (!otpRecord) {
      return next({
        status: 400,
        message: "Invalid OTP",
      });
    }

    const currentTime = new Date();
    if (otpRecord.expiresAt < currentTime) {
      return next({
        status: 400,
        message: "OTP has expired",
      });
    }

    // Generate a temporary token valid for 15 minutes
    const tempToken = generateTempToken({ email: user.email });

    // Delete the OTP record as it has been used
    await OTP.deleteOne({ userId: user._id });

    return successResponse(res, { tempToken }, "OTP verified successfully");
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { tempToken, newPassword } = req.body;

    if (!tempToken || !newPassword) {
      return next({
        status: 400,
        message: "Please provide the temporary token and new password",
      });
    }

    // Validate the temporary token
    const payload = isTokenValid(tempToken);

    if (!payload) {
      return next({
        status: 400,
        message: "Invalid or expired token",
      });
    }

    const { email } = payload;

    const user = await User.findOne({ email });

    if (!user) {
      return next({
        status: 400,
        message: "User not found",
      });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    return successResponse(res, null, "Password reset successfully!");
  } catch (err) {
    next(err);
  }
};

const setupProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, color } = req.body;
    const userId = req.user.userId; // Assuming user ID is available in req.user

    if (!firstName || !lastName || color === undefined) {
      return next({
        status: 400,
        message: "Please provide all profile details",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true }
    );

    if (!user) {
      return next({
        status: 404,
        message: "User not found",
      });
    }

    return successResponse(
      res,
      {
        email: user.email,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        image: user?.image || "",
        color: user && user.color !== undefined ? user.color : null,
        profileSetup: user.profileSetup,
      },
      "Profile setup successfully!"
    );
  } catch (err) {
    return next(err);
  }
};

const userInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user)
      return next({
        status: 404,
        message: "User not found!",
      });

    return successResponse(
      res,
      {
        email: user.email,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        image: user?.image || "",
        color: user && user.color !== undefined ? user.color : null,
        profileSetup: user.profileSetup,
      },
      "User Info retrieved successfully!"
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  requestPasswordReset,
  verifyResetPasswordOtp,
  resetPassword,
  setupProfile,
  userInfo,
};
