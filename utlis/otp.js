const otpGenerator = require("otp-generator");
require("dotenv").config();
const jwt = require("jsonwebtoken");
function CreateOtpAndToken(userData,expireTime) {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  console.log(otp);
  

  var token = jwt.sign({ userData, otp }, process.env.PRIVATE_KEY,{expiresIn: expireTime});

  return { otp, token };
}

module.exports = CreateOtpAndToken;
