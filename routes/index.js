var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const MemberSchema = require('../models/member');
const MessageSchema = require('../models/message');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'OnlyMembers', login: false });
});

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
      res.render('index', { title: 'OnlyMembers', login: true });
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

router.get('/login-success', function(req, res, next) {
  res.render('index', { title: 'OnlyMembers', login: true });
});

router.get('/login-failure', function(req, res, next) {
  res.render('index', { title: 'OnlyMembers', login: false });
});

router.post('/login-success', asyncHandler(async (req, res, next) => {
  try {
      const newMessage = new MessageSchema({
        name: req.body.title,
        email: req.body.message,
        author: "author",
        timestamp: Date.now()
      });
      await newMessage.save();
      res.render('index', { title: 'OnlyMembers', login: true });
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
      res.render('index', { title: 'OnlyMembers', login: true });
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

router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;