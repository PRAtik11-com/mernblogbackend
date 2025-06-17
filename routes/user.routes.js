const express = require("express");
const usercontroller = require("../controllers/user.controllers");
const Auth = require("../middleware/auth");
const upload = require("../config/multer");
const CheckRole = require("../middleware/admin");

const userRouter = express.Router();

userRouter.post("/signup", usercontroller.signup);
userRouter.post("/verify", usercontroller.verify);
userRouter.post("/signin", usercontroller.signin);
userRouter.get("/getuserinfo/:userId", Auth, usercontroller.getUserData);
userRouter.patch(
  "/updateuserinfo/:userId",
  Auth,
  upload.single("profileImage"),
  usercontroller.updateUserInfo
);

// password-reset-fun....
userRouter.post(
  "/resetpassword",
  usercontroller.resetPasswordByEmail
); // for create token ,otp and sending reset-password-email

userRouter.patch(
  "/verifypassword",
  usercontroller.verifyPasswordByOtp
); // for verify token and reset password

userRouter.get("/logout", Auth, usercontroller.logout); // for logout

// users data get by admin
userRouter.get("/getallusers", Auth,CheckRole ,usercontroller.getAllUsers); 

userRouter.delete(
  "/deleteuser/:userId",
  Auth,
  CheckRole,
  usercontroller.deleteUserByAdmin
); // for delete user by admin

module.exports = userRouter;
