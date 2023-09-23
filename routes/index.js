var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const MemberSchema = require('../models/member');
const MessageSchema = require('../models/message');
const session = require("express-session");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

const LocalStrategy = require("passport-local").Strategy;

/* GET home page. */
router.get("/", asyncHandler(async (req, res, next) => {
  const allMessages = await MessageSchema.find({})
    .populate('author')
    .sort({timestamp: -1})
    .exec();
  res.render('index', { title: 'OnlyMembers', login: false, messages: allMessages, errors: [] });
}));

const postLogin = asyncHandler(async (req, res, next) => {
  try {
    let errors = [];

    if (req.body.name) {
      await body('name')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Name must have at least 3 characters')
        .escape()
        .run(req);
      await body('email')
        .trim()
        .isEmail()
        .withMessage('Email field must contain a valid email adress')
        .escape()
        .run(req);
      await body('password')
        .trim()
        .isLength({ min: 8 })
        .isStrongPassword({
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 0,
          returnScore: false
        })
        .withMessage('Password must have at least 8 characters, 1 lowercase, 1 uppercase, 1 number and 1 symbol')
        .escape()

      errors = validationResult(req);

      if (!errors.isEmpty()) {
        const allMessages = await MessageSchema.find({})
          .populate('author')
          .sort({ timestamp: -1 })
          .exec();
        return res.render('index', { title: 'OnlyMembers', login: false, messages: allMessages, errors: errors.array() });
      }

      //validated, now check if user exists
      

      const newMember = new MemberSchema({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        isAdmin: false
      });
      await newMember.save();
    }

    const allMessages = await MessageSchema.find({})
      .populate('author')
      .sort({ timestamp: -1 })
      .exec();

    res.render('index', { title: 'OnlyMembers', login: true, messages: allMessages, errors: [] });
  } catch(err) {
    return next(err);
  }
});

router.post('/', postLogin);

router.get("/login-success", asyncHandler(async (req, res, next) => {
  const allMessages = await MessageSchema.find({})
    .populate('author')
    .sort({timestamp: -1})
    .exec();
  res.render('index', { title: 'OnlyMembers', login: true, messages: allMessages, errors: [] });
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
      const allMessages = await MessageSchema.find({})
        .populate('author')
        .sort({timestamp: -1})
        .exec();
      res.render('index', { title: 'OnlyMembers', login: true, messages: allMessages, errors: [] });
    }  catch(err) {
    return next(err);
  }}
));

router.post('/login-failure', postLogin);

router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;