var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const MemberSchema = require('../models/member');
const MessageSchema = require('../models/message');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

/* GET home page. */
router.get("/", asyncHandler(async (req, res, next) => {
  const allMessages = await MessageSchema.find({})
    .populate('author')
    .exec();

  res.render('index', { title: 'OnlyMembers', login: false, messages: allMessages });
}));

router.post('/', asyncHandler(async (req, res, next) => {
  try {
    if (req.body.name) {
      const newMember = new MemberSchema({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        isAdmin: false
      });
      await newMember.save();
      const allMessages = await MessageSchema.find({}).populate('author').exec();
      res.render('index', { title: 'OnlyMembers', login: true, messages: allMessages });
    } else {
      console.log("login")
      passport.authenticate("local", {
        successRedirect: "/login-success",
        failureRedirect: "/login-failure"
      })(req, res, next);
    }

  } catch(err) {
    return next(err);
  }
}));

router.get("/login-success", asyncHandler(async (req, res, next) => {
  const allMessages = await MessageSchema.find({})
    .populate('author')
    .exec();
  res.render('index', { title: 'OnlyMembers', login: true, messages: allMessages });
}));

router.get("/login-failure", asyncHandler(async (req, res, next) => {
  const allMessages = await MessageSchema.find({})
    .populate('author')
    .exec();
  res.render('index', { title: 'OnlyMembers', login: false, messages: allMessages });
}));

router.post('/login-success', asyncHandler(async (req, res, next) => {
  try {
      const newMessage = new MessageSchema({
        title: req.body.title,
        message: req.body.message,
        author: req.user._id,
        timestamp: Date.now()
      });
      await newMessage.save();
      const allMessages = await MessageSchema.find({}).populate('author').exec();
      res.render('index', { title: 'OnlyMembers', login: true, messages: allMessages });
    }  catch(err) {
    return next(err);
  }}
));


router.post('/login-failure', asyncHandler(async (req, res, next) => {
  try {
    if (req.body.name) {
      const newMember = new MemberSchema({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        isAdmin: false
      });
      await newMember.save();
      const allMessages = await MessageSchema.find({}).populate('author').exec();
      res.render('index', { title: 'OnlyMembers', login: true, messages: allMessages });
    } else {
      passport.authenticate("local", {
        successRedirect: "/login-success",
        failureRedirect: "/login-failure"
      })(req, res, next);
    }

  } catch(err) {
    return next(err);
  }
}));

router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;