const CreateOtpAndToken = require("../utlis/otp");
const Sendmail = require("../utlis/sendmail");
const ejs = require("ejs");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.models");
const usercontroller = {
  signup: async (req, res) => {
    const { email, name, password } = req.body;

    if (req.body.role) {
      return res
        .status(400)
        .json({ message: "you can not have permission for this" });
    }
    if (!email || !name || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const { otp, token } = CreateOtpAndToken({ ...req.body }, "5m");

    try {
      const htmltemplate = await ejs.renderFile(
        __dirname + "/../views/email.ejs",
        {
          name,
          otp,
        }
      );

      let result = await Sendmail(email, htmltemplate, "Verification Otp");

      res
        .cookie("verfication_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 15 * 60 * 1000,
        })
        .status(200)
        .json({ message: "Otp send ..." });
    } catch (error) {
      res.status(400).json({ message: error?.message });
    }
  },
  verify: async (req, res) => {
    if (!req.cookies.verfication_token) {
      return res.status(400).json({ message: "Please signup first" });
    }

    try {
      var decoded = jwt.verify(
        req.cookies.verfication_token,
        process.env.PRIVATE_KEY
      );
      if (!decoded) {
        return res.status(400).json({ message: "Token is Invalid" });
      }
      const { otp, userData } = decoded;

      if (otp !== req.body.otp) {
        return res.status(400).json({ message: "Otp is not valid" });
      }
      // hash the password
      try {
        const hashpassword = await bcrypt.hash(userData.password, 10);
        // save the user in database
        const user = await UserModel.create({
          ...userData,
          password: hashpassword,
        });

        // conformation message
        const htmltemplate = await ejs.renderFile(
          __dirname + "/../views/confirmation.ejs",
          {
            name: userData.name,
          }
        );
        await Sendmail(userData.email, htmltemplate, "Confirmation message");

        res.status(200).json({ message: "User created successfully", user });
      } catch (error) {
        return res.status(400).json({ message: error?.message });
      }
    } catch (error) {
      return res.status(400).json({ message: error?.message });
    }
  },
  signin: async (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const isExistUser = await UserModel.findOne({ email: req.body.email });

    if (!isExistUser) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(
      req.body.password,
      isExistUser.password
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const { password, ...rest } = isExistUser._doc;
    const { token } = CreateOtpAndToken({ ...rest }, "7d");
    if (!token) {
      return res.status(400).json({ message: "Token not generated" });
    }
    res
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 604800000,
        secure: true,
        sameSite: "None",
      })
      .status(200)
      .json({ message: "User logged in successfully", user: rest });
  },

  getUserData: async (req, res) => {
    // if (req.params.userId !== req.user._id) {
    //   return res.status(400).json({ message: "You are not authorized" });
    // }
    try {
      const user = await UserModel.findById(req.params.userId).select(
        "-password"
      );
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User found", user });
    } catch (error) {
      res.status(400).json({ message: error?.message });
    }
  },
  updateUserInfo: async (req, res) => {
    if (req.params.userId !== req.user._id) {
      return res.status(400).json({ message: "You are not authorized" });
    }
    if (!req.file) {
      const updateprofile = await UserModel.findByIdAndUpdate(
        req.params.userId,
        { $set: { ...req.body } },
        { new: true }
      );
      if (!updateprofile) {
        return res
          .status(400)
          .json({ message: "Error while updating profile" });
      }
      res
        .status(200)
        .json({ message: "Data updated successfully", user: updateprofile });
    }
    if (req.file) {
      const updateprofile = await UserModel.findByIdAndUpdate(
        req.params.userId,
        { $set: { ...req.body, profileImage: req.file.originalname } },
        { new: true }
      );
      if (!updateprofile) {
        return res
          .status(400)
          .json({ message: "Error while updating profile" });
      }
      res
        .status(200)
        .json({ message: "Data updated successfully", user: updateprofile });
    }
  },
  resetPasswordByEmail: async (req, res) => {
    // for create token ,otp and sending reset-password-email
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    try {
      const isExistUser = await UserModel.findOne({ email });

      if (!isExistUser) {
        return res.status(400).json({ message: "User not found" });
      }
      const { otp, token } = CreateOtpAndToken({ ...isExistUser }, "5m");

      const htmltemplate = await ejs.renderFile(
        __dirname + "/../views/resetpassword.ejs",
        {
          name: isExistUser.name,
          otp,
        }
      );

      await Sendmail(email, htmltemplate, "Reset Password");

      res
        .cookie("Password_Reset_Token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 15 * 60 * 1000,
        })
        .status(200)
        .json({ message: "Reset password email sent successfully" });
    } catch (error) {
      res.status(400).json({ message: error?.message });
    }
  },
  verifyPasswordByOtp: async (req, res) => {
    // verfiy  token and otp and further reset the password
    if (!req.cookies.Password_Reset_Token) {
      return res
        .status(400)
        .json({ message: "Password reset token is missing" });
    }

    try {
      var decoded = jwt.verify(
        req.cookies.Password_Reset_Token,
        process.env.PRIVATE_KEY
      );
      if (!decoded) {
        return res.status(400).json({ message: "Token is Invalid" });
      }
      const { otp, userData } = decoded;

      if (otp !== req.body.otp) {
        return res.status(400).json({ message: "Otp is not valid" });
      }
      // hash the password
      try {
        const hashpassword = await bcrypt.hash(req.body.password, 10);
        // save the user in database
        const user = await UserModel.findByIdAndUpdate(userData._doc._id, {
          $set: { ...userData._doc, password: hashpassword },
        });

        console.log(user);
        // conformation message
        const htmltemplate = await ejs.renderFile(
          __dirname + "/../views/passwordresetsuccesfully.ejs",
          {
            name: userData.name,
          }
        );
        console.log(htmltemplate);
        await Sendmail(
          userData._doc.email,
          htmltemplate,
          "Password Reset Successfully"
        );

        res.status(200).json({ message: "Password reset successfully", user });
      } catch (error) {
        return res.status(400).json({ message: error?.message });
      }
    } catch (error) {
      return res.status(400).json({ message: error?.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      });

      res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // admin side
  getAllUsers: async (req, res) => {
    // logic for getting all users
    const limit = req.query.limit || 2;
    try {
      const users = await UserModel.find().select("-password").limit(limit);
      const totalUsers = await UserModel.countDocuments();
      if (!users) {
        return res.status(400).json({ message: "No user found" });
      }
      res.status(200).json({ message: "All users", users, totalUsers });
    } catch (error) {
      res.status(400).json({ message: error?.message });
    }
  },
  deleteUserByAdmin: async (req, res) => {
    if (!req.params.userId) {
      return res.status(400).json({ message: "Please provide userId" });
    }
    try {
      const user = await UserModel.findByIdAndDelete(req.params.userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully", user });
    } catch (error) {
      res.status(400).json({ message: error?.message });
    }
  },
};

module.exports = usercontroller;

// password-reset-approch
