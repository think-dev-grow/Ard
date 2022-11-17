const User = require("../models/User");
const randomize = require("randomatic");
const { Random } = require("random-js");
const crypto = require("crypto");
const rn = require("random-number");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const handleError = require("../utils/error");
const sendMail = require("../utils/sendMail");

const random = new Random();

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

      sendMail(data.email, value);

      const { email, _id } = data._doc;

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

      sendMail(data.email, value);

      const { email, _id } = data._doc;

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

    const token = jwt.sign(payload, process.env.JWT, { expiresIn: "30s" });

    res.cookie(String(user._id), token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 30),
      httpOnly: true,
      sameSite: "lax",
    });

    const { password, ...others } = user._doc;

    res
      .status(200)
      .json({ success: true, msg: "Login successfull wi", ui: others, token });
  } catch (error) {
    console.log(error);
    next(handleError(500, "Oops, something went wrong"));
  }
};

const userVerification = async (req, res, next) => {
  try {
    const cookies = req.headers.cookie;
    const token = cookies.split("=")[1];

    res.send(token);

    if (!token) return next(handleError(404, "Unauthorize request"));

    jwt.verify(String(token), process.env.JWT, (err, user) => {
      if (err) return next(handleError(404, "Invalid Token"));

      req.id = user.id;
    });
    next();
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const userId = req.id;

    const user = await User.findById(userId, "-password");

    if (!user) return next(handleError(404, "User not found"));

    res.status(200).json({ success: true, user });
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
  getUser,
};
