const User = require("../models/User");
const randomize = require("randomatic");
const { Random } = require("random-js");
const crypto = require("crypto");
const rn = require("random-number");
const jwt = require("jsonwebtoken");

const handleError = require("../utils/error");

const random = new Random();

const nodemailer = require("nodemailer");

const options = {
  min: 100,
  max: 999,
  integer: true,
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false,
  auth: {
    user: "leapsailafrica@gmail.com",
    pass: "xqrtwkdverhddksi",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendOTP = async (req, res, next) => {
  try {
    const check = await User.findOne({ email: req.body.email });

    if (check && !check.dhid) {
      res.send("uncomplete profile");
    } else if (check.dhid) {
      res.send("user already exist");
    } else if (!check) {
      res.send("user created.");
    }

    //   const user = new User(req.body);
    //   let value = randomize("0", 7);

    //   const data = await user.save();

    //   const payload = {
    //     id: data._id,
    //     et: value,
    //   };

    //   const token = jwt.sign(payload, process.env.JWT, { expiresIn: "3m" });

    //   const mailOptions = {
    //     from: "leapsailafrica@gmail.com",
    //     to: user.email,
    //     subject: "Email verification",
    //     html: `
    //     <div style="text-align: center;">
    //   <img src="./img/logo.svg" alt="" class="img-fluid" style="padding: 30px 0px;">
    //   <hr>
    //   <img src="./img/email-avi.svg" alt="" class="img-fluid">
    //   <h6 style="color: #041D05; font-size: 18px; font-weight: 500; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Please use the OTP code below to complete your account setup:</h6>
    //   <p style="color: #041D05; font-size: 58px; font-weight: 700; line-height: 76px; font-family: 'Ubuntu'; margin-top: 20px;">${value}</p>
    //   <h5 style="color: #041D05; font-size: 17px; font-weight: 400; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Or click the below link to verify your email address.</h5>
    //   <a href="https://ardilla-web.netlify.app/complete-profile">Click Here
    //   </a>
    //   <h3 style="color: #041D05; font-size: 19px; font-weight: 600; line-height: 26px; font-family: 'Ubuntu'; margin-top: 70px;">- The Ardilla Team</h3>
    //   <small style="color: #041D05; font-size: 17px; font-weight: 500; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Copyright © 2022 Ardilla. All rights reserved </small>
    // </div>
    //     `,
    //   };

    //   transporter.sendMail(mailOptions, (err, info) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log(info);
    //     }
    //   });

    //   const { email, _id } = data._doc;

    //   res.status(200).json({ id: _id, email, token });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const code = req.body.code;
    let value;
    const token = req.params.token;

    jwt.verify(token, process.env.JWT, (err, user) => {
      if (err) return res.send("this token is now invalid");

      value = user;
    });

    if (value.et === code) {
      return res.status(200).json({ success: true, msg: "verification okay" });
    } else {
      next(handleError(500, "incorrect token"));
    }
  } catch (error) {
    next(error);
  }
};

const completeProfile = async (req, res, next) => {
  try {
    const check = await User.findById(req.params.id);

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
      check.password = req.body.password;
      check.kodeHex = req.body.kodeHex;

      const verifiedUser = await check.save();

      res.status(200).json(verifiedUser);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOTP, verifyOTP, completeProfile };
