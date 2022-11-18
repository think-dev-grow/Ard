const User = require("../models/User");
const randomize = require("randomatic");
const { Random } = require("random-js");
const crypto = require("crypto");
const rn = require("random-number");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const handleError = require("../utils/error");
const { sendVerificationMail, resetPassword } = require("../utils/sendMail");

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

      sendVerificationMail(data.email, value);

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

      sendVerificationMail(data.email, value);

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

      res
        .status(200)
        .json(`Hey ${verifiedUser.kodeHex},Registration completed.`);
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

    const sqUpdate = await User.findOneAndUpdate(
      { _id: req.params.id },
      { securityQusetion: sq },
      { new: true }
    );

    res.status(200).json({
      success: true,
      msg: `Dont worry ${sqUpdate.kodeHex} , Your secret is safe with us`,
    });
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

    const { password, ...others } = user._doc;

    res
      .status(200)
      .json({ success: true, msg: "Login successfull", ui: others, token });
  } catch (error) {
    console.log(error);
    next(handleError(500, "Oops, something went wrong"));
  }
};

//Forgot-Password API
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(handleError(404, "This user does not exist."));

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, process.env.JWT, { expiresIn: "5m" });

    //send mail that take them to securityQuestion

    resetPassword(user.email, user.firstname, user.kodeHex, token);

    res.status(200).json({
      success: true,
      msg: `Hey ${user.kodeHex} Check your email and reset password`,
      token,
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, "Oops, something went wrong"));
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.params.token;

    jwt.verify(String(token), process.env.JWT, (err, user) => {
      if (err) return res.send("Token expired");

      res.redirect(`https://ardilla-web.netlify.app/set-password/${user.id}`);
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, "Connection Error "));
  }
};

const resetPassword = async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id });
  if (!user) return next(handleError(404, "User does not exist."));

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { password: hash } }
    );
    res.status(200).json({
      success: true,
      msg: `${userData.kodeHex} password has been reset`,
    });
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
  forgotPassword,
  verifyToken,
  resetPassword,
};
