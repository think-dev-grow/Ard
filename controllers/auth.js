const User = require("../models/User");
const randomize = require("randomatic");
const { Random } = require("random-js");
const crypto = require("crypto");
const rn = require("random-number");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const handleError = require("../utils/error");

const random = new Random();

var { SendMailClient } = require("zeptomail");

const url = "api.zeptomail.com/";
const token =
  "Zoho-enczapikey wSsVR61w/xT1Xah0lDD8Lr86kQhQA130EEV/31en4yL6Hf7Ep8dvlUHOBAauSKUYRDVsFTBHoOgpmxYHh2Bcidwpn1ACDiiF9mqRe1U4J3x17qnvhDzOX2VfkRuKLokAxghtn2hmGsEk+g==";

let client = new SendMailClient({ url, token });

const options = {
  min: 100,
  max: 999,
  integer: true,
};

//sendOTP API
const sendOTP = async (req, res, next) => {
  try {
    const check = await User.findOne({ email: req.body.email });

    //if there's is no user Logic
    if (!check) {
      const user = new User(req.body);
      let value = randomize("0", 7);

      const data = await user.save();

      const payload = {
        id: data._id,
        et: value,
      };

      const token = jwt.sign(payload, process.env.JWT, { expiresIn: "3m" });

      const { email, _id } = data._doc;

      // client
      //   .sendMail({
      //     bounce_address: "NOREPLY@bounce.ardilla.africa",
      //     from: {
      //       address: "noreply@ardilla.africa",
      //       name: "Ardilla",
      //     },
      //     to: [
      //       {
      //         email_address: {
      //           address: `${data.email}`,
      //           name: "",
      //         },
      //       },
      //     ],
      //     subject: "Email verifaction",
      //     htmlbody: `<div style="text-align: center;">
      //   <img src="https://ibb.co/CBWz5js" alt="" class="img-fluid" style="padding: 30px 0px;">
      //   <hr>
      //   <img src="https://ibb.co/S5wVMWn" alt="" class="img-fluid">
      //   <h6 style="color: #041D05; font-size: 18px; font-weight: 500; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Please use the OTP code below to complete your account setup:</h6>
      //   <p style="color: #041D05; font-size: 58px; font-weight: 700; line-height: 76px; font-family: 'Ubuntu'; margin-top: 20px;">${value}</p>
      //   <h5 style="color: #041D05; font-size: 17px; font-weight: 400; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Or click the below link to verify your email address.</h5>
      //   <a href="https://ardilla-web.netlify.app/otp">Click Here
      //   </a>
      //   <h3 style="color: #041D05; font-size: 19px; font-weight: 600; line-height: 26px; font-family: 'Ubuntu'; margin-top: 70px;">- The Ardilla Team</h3>
      //   <small style="color: #041D05; font-size: 17px; font-weight: 500; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Copyright © 2022 Ardilla. All rights reserved </small>
      // </div>`,
      //   })
      //   .then((resp) => console.log("success", resp))
      //   .catch((error) => console.log("error", error));

      res.status(200).json({ id: _id, email, token });
    }

    //if there's an unfinished Registration
    if (check && !check.dhid) {
      await User.findOneAndDelete({ email: check.email });

      const user = new User(req.body);
      let value = randomize("0", 7);

      const data = await user.save();

      const payload = {
        id: data._id,
        et: value,
      };

      const token = jwt.sign(payload, process.env.JWT, { expiresIn: "3m" });

      const { email, _id } = data._doc;

      // client
      //   .sendMail({
      //     bounce_address: "NOREPLY@bounce.ardilla.africa",
      //     from: {
      //       address: "noreply@ardilla.africa",
      //       name: "Ardilla",
      //     },
      //     to: [
      //       {
      //         email_address: {
      //           address: `${data.email}`,
      //           name: "",
      //         },
      //       },
      //     ],
      //     subject: "Email verication",
      //     htmlbody: `<div style="text-align: center;">
      //   <img src="https://ibb.co/CBWz5js" alt="" class="img-fluid" style="padding: 30px 0px;">
      //   <hr>
      //   <img src="https://ibb.co/S5wVMWn" alt="" class="img-fluid">
      //   <h6 style="color: #041D05; font-size: 18px; font-weight: 500; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Please use the OTP code below to complete your account setup:</h6>
      //   <p style="color: #041D05; font-size: 58px; font-weight: 700; line-height: 76px; font-family: 'Ubuntu'; margin-top: 20px;">${value}</p>
      //   <h5 style="color: #041D05; font-size: 17px; font-weight: 400; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Or click the below link to verify your email address.</h5>
      //   <a href="https://ardilla-web.netlify.app/complete-profile">Click Here
      //   </a>
      //   <h3 style="color: #041D05; font-size: 19px; font-weight: 600; line-height: 26px; font-family: 'Ubuntu'; margin-top: 70px;">- The Ardilla Team</h3>
      //   <small style="color: #041D05; font-size: 17px; font-weight: 500; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Copyright © 2022 Ardilla. All rights reserved </small>
      // </div>`,
      //   })
      //   .then((resp) => console.log("success", resp))
      //   .catch((error) => console.log("error", error));

      res.status(200).json({ id: _id, email, token, msg: "stale user" });
    }

    //if user has finish his registration
    if (check && check.dhid) {
      return next(handleError(400, "User already exist"));
    }
  } catch (error) {
    next(error);
  }
};

//VerifyOTP API
const verifyOTP = async (req, res, next) => {
  try {
    const code = req.body.code;
    let value;
    const token = req.params.token;

    jwt.verify(String(token), process.env.JWT, (err, user) => {
      if (err) return res.send("Token expired");

      value = user;
    });

    if (value.et === code) {
      return res.status(200).json({ success: true, msg: "verification okay" });
    } else {
      next(handleError(500, "incorrect code"));
    }
  } catch (error) {
    next(error);
  }
};

//Complete-profile API
const completeProfile = async (req, res, next) => {
  try {
    const check = await User.findById(req.params.id);

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    if (!check) {
      return next(handleError(404, "User does not exist."));
    } else {
      check.firstname = req.body.firstname;
      check.lastname = req.body.lastname;
      check.uid = `30${rn(options)}${random.integer(10, 99)}${randomize(
        "0",
        3
      )}`;
      check.dhid = crypto.randomBytes(64).toString("hex");
      check.contact = req.body.contact;
      check.password = hash;
      check.kodeHex = req.body.kodeHex;

      const verifiedUser = await check.save();

      res.status(200).json(verifiedUser);
    }
  } catch (error) {
    next(error);
  }
};

//Wrong Email API
const wrongEmail = async (req, res, next) => {
  try {
    const check = await User.findById(req.params.id);

    if (!check) return next(handleError(404, "User does not exist."));

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, msg: "email removed from DB" });
  } catch (error) {
    next(error);
  }
};

//Security Question API
const securityQusetion = async (req, res, next) => {
  try {
    const check = await User.findById(req.params.id);

    if (!check) return next(handleError(404, "User does not exist."));

    const sq = req.body.securityQusetion;

    const sqUpdaate = await User.findOneAndUpdate(
      { _id: req.params.id },
      { securityQusetion: sq },
      { new: true }
    );

    res.status(200).json(sqUpdaate);
  } catch (error) {
    next(error);
  }
};

//login API
const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(handleError(404, "User does not exist."));

    if (!user.dhid) return next(handleError(404, "This email is Invalid."));

    const confirmPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!confirmPassword) return next(handleError(400, "Password incorrect."));

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, process.env.JWT, { expiresIn: "1hr" });

    const { password, ...others } = user._doc;

    res
      .status(200)
      .json({ success: true, msg: "Login successfull", ui: others, token });
  } catch (error) {
    console.log(error);
    next(handleError(500, "Oops, something went wrong"));
  }
};

const userVerification = async (req, res, next) => {
  try {
    const headers = req.headers["authorization"];
    const token = headers.split(" ")(1);

    if (!token) return next(handleError(404, "Unauthorize request"));

    jwt.verify(String(token), process.env.JWT, (err, user) => {
      if (err) return next(handleError(404, "Invalid Token"));

      res.send(user);
    });
  } catch (error) {
    next(error);
  }
};

//Forgot-Password API
const forgetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(handleError(404, "This user does not exist."));

    //send mail that take them to securityQuestion
  } catch (error) {
    console.log(error);
    next(handleError(500, "Oops, something went wrong"));
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  completeProfile,
  wrongEmail,
  securityQusetion,
  login,
  userVerification,
};
