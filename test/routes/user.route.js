const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { isAuth, isAdmin } = require("../middlewares/auth.middleware");

router.get("/", async (req, res) => {
  res.send({ message: "Ok api is working" });
});

router.post("/superAdmin", async (req, res) => {
  try {
    const {fullName, email,password} = req.body;
    const UserExistHere = await User.findOne({ email:email });
    if (UserExistHere) {
      res.status(226).send({ msg: "User Already Registered here" });
    }
    const HashedPassword = bcrypt.hashSync(password, 10);

    const userSave = new User({
      fullName: fullName,
      email: email,
      password: HashedPassword,
      isAdmin: true,
    });
    const NewUser = await userSave.save();
    if (NewUser) {
      const accessToken = jwt.sign(
        {
          _id: NewUser._id,
          fullName: NewUser.fullName,
          email: NewUser.email,
          isAdmin: NewUser.isAdmin,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '48h',
        })
      if (accessToken) {
        res.status(201).send({ msg: "SuperAdmin registration success", newuser: NewUser });
      }
    }else{
      res.status(500).send({ msg: "user registration failed" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/register", async (req, res) => {
  const userRegisterData = req.body;

  if (!userRegisterData) {
    res.status(404).send({ msg: "please enter all feild" });
  }

  try {
    const UserExistHere = await User.findOne({ email: userRegisterData.email });
    if (UserExistHere) {
      res.status(226).send({ msg: "User Already Registered here" });
    }
    const HashedPassword = bcrypt.hashSync(req.body.password, 10);

    const userSave = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: HashedPassword,
    });
    const NewUser = await userSave.save();
    if (NewUser) {
      const accessToken = jwt.sign(
        {
          _id: NewUser._id,
          fullName: NewUser.fullName,
          email: NewUser.email,
          isAdmin: NewUser.isAdmin,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '48h',
        })
      if (accessToken) {
        res.status(201).send({ msg: "user registration success", newuser: NewUser });
      }
    }else{
      res.status(500).send({ msg: "user registration failed" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {

    if (!req.body.email && !req.body.password) {
      res.status(404).send("please enter all feild");
    }
    const validUser =await User.findOne({'email': req.body.email,'isActivated':true});
    if (!validUser) {
      res.status(404).send({ msg: "You are Blocked by Super Admin" });
    }else{
      const isMatch = bcrypt.compareSync(req.body.password, validUser.password);
      if (validUser && isMatch) {
        const accessToken = jwt.sign(
          {
            _id: validUser._id,
            fullName: validUser.fullName,
            email: validUser.email,
            isAdmin: validUser.isAdmin,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '48h',
          })
          res.status(200).send({
            msg: "login-success",
            token: accessToken,
            data: validUser,
          });
      } else {
        res.status(404).send({ msg: "Invalid Credentials" });
      }
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/users", isAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    if (users) {
      res.status(200).send({
        msg: "data found",
        count: users.length,
        data: users,
      });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
    
  } catch (error) {
    res.status(400).send({ message: error.message });    
  }
});

router.put("/:id",isAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      const updatedUser = await user.save();
      res.status(200).send({
        msg: "user updated successfully",
        data: updatedUser,
      });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
    
  } catch (error) {
    res.status(400).send({ message: error.message });    
  }
});

router.get("/:id", isAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (user) {
      res.status(200).send({
        msg: "data fetched successfully",
        data: user,
      });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
    
  } catch (error) {
    res.status(400).send({ message: error.message });    
  }
});

router.put("/passwordUpdate/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const Upassword = await User.findByIdAndUpdate(userId, { password: hashedPassword });
    if (Upassword) {
      res.status(200).send({msg:"Password Changed"});
    } else {
      res.status(404).send({msg:"Password Not Changed"});
    }
  } catch (error) {
    res.status(400).send({ message: error.message });    
  }
});

router.put("/activate/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const active = await User.findByIdAndUpdate({'_id':req.params.id}, { 'isActivated': req.body.isActivated }, { new: true });
    if (active) {
      res.status(200).send({msg:'user updated successfully'});
    } else {
      res.status(404).send({msg:"fail to update user"});
    }
  } catch (error) {
    res.status(400).send({ message: error.message });    
  }
});

module.exports = router;
