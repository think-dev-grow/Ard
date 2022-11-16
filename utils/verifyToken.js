const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT, (err, user) => {
      if (err) return res.send("this token is now invalid");

      req.user = user;
      next();
    });
  } else {
    return res.send("Not allowwed");
  }
};

module.exports = verifyToken;
