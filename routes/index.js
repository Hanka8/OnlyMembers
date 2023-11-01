var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const MemberSchema = require('../models/member');
const MessageSchema = require('../models/message');
const session = require("express-session");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const LocalStrategy = require("passport-local").Strategy;

const handleIndexForms = asyncHandler(async (req, res, next) => {
  try {
    let errors = [];

    if (req.body.name) {
      //handle adding user if the index request contains a name

      // --- validate input
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
        .custom(async (value) => {
          const user = await MemberSchema.find({ email: value });
          if (user.length > 0) {
            throw new Error('Email already in use');
          }
        })
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
        .withMessage('Password must have at least 8 characters, 1 lowercase, 1 uppercase and 1 number')
        .escape()
        .run(req);
      await body('password2')
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Passwords do not match');
          }
          return true;
        })
        .escape()
        .run(req);

      errors = validationResult(req);

      if (!errors.isEmpty()) {
        const allMessages = await MessageSchema.find({})
          .populate('author')
          .sort({ timestamp: -1 })
          .exec();
        return res.render('index', { title: 'OnlyMembers', login: false, messages: allMessages, errors: errors.array() });
      }

      // --- secure password
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        }
        // --- add user
        const newMember = new MemberSchema({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
          isAdmin: false
        });
        await newMember.save();

        // --- login user
        req.login(newMember, (err) => {
        if (err) {
          return next(err);
        }
        });

      });

      res.redirect('/login-success');

  // handle login if the index request contains an email and password
  } else {
    // --- validate input
    await body('username')
      .trim()
      .escape()
      .run(req);
    await body('password')
      .trim()
      .escape()
      .run(req);

    // --- login user
    passport.authenticate("local", {
      successRedirect: "/login-success",
      failureRedirect: "/login-failure"
    })(req, res, next);
  }

    } catch(err) {
    return next(err);
    }
});

/* GET requests */
router.get("/", asyncHandler(async (req, res, next) => {
  const allMessages = await MessageSchema.find({})
    .populate('author')
    .sort({timestamp: -1})
    .exec();
  res.render('index', { title: 'OnlyMembers', login: false, messages: allMessages, errors: [] });
}));

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
  res.render('index', { title: 'OnlyMembers', login: false, messages: allMessages, errors: [] });
}));

router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

/* POST requests */
router.post('/', handleIndexForms);

router.post('/login-failure', handleIndexForms);

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

module.exports = router;