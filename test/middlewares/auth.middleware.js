const jwt = require('jsonwebtoken');


const isAuth = (req, res, next) => {
  const token = req.headers.authorization;
  // console.log('mytokek:',token)
  if (token) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, {algorithm: 'HS256'}, async (err, decode) => {
      if (err) {
        return res.status(401).send({ message: 'Invalid Token' });
      }
      req.user = decode;
      next();
      return;
    });
  } else {
    return res.status(401).send({ message: 'unauthorized to access user data' });
  }
};

const isAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(401).send({ message: 'unauthorized to access Admin data,' });
};

module.exports= { isAuth, isAdmin };