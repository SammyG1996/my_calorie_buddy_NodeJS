"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");
const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");
const {verifyGoogleToken} = require("../middleware/auth")
const jwt_decode = require('jwt-decode');

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});


/** POST /auth/oauth:  { Google JWT } => { token, username }
 * 
 * After verifying Googles JWT the user is found and then a new JWT token is return with the username 
 * which can be used to authenticate further requests
 * 
 * Authorization required: none
 * 
 */
router.post("/oauth", verifyGoogleToken, async function (req, res, next) {
  try {
    const { credential } = req.body;
    const decodedJWT = jwt_decode(credential);
    const {email} = decodedJWT
    const user = await User.getUserDataAfterOAuth(email);
    console.log(user);
    const token = createToken(user);
    return res.json({ token, "username" : user.username });
  } catch (err) {
    return next(err);
  }
});



/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
