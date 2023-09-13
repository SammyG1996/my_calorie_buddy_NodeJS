"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY, CLIENT_ID } = require("../config");
const { UnauthorizedError } = require("../expressError");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID); // Replace CLIENT_ID with your actual client ID




/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  
  try {
    const authHeader = req.headers && req.headers.authorization;
    console.log(req.headers)
    console.log(req.headers.authorization)

    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 * 
 * If the user is not logged in, and they are not an admin and trying to look at all users, or another user thats not them, they will be denied.
 * 
 * However, If the local user thats logged in is the same as the user in the request query params, then they are granted access since they are
 * trying to view their own information.
 */

function ensureLoggedIn(req, res, next) {
  console.log('res', res.locals.user)
  try {
    if (!res.locals.user || !res.locals.user.isAdmin){
      console.log(req.params)
      if(res.locals.user && req.params && res.locals.user.username === req.params.username){
        return next()
      }
      throw new UnauthorizedError();
    }  

    return next();
  } catch (err) {
    return next(err);
  }
}


/**
 * Middleware to use when you need to authenticate a Google JWT token
 * 
 */

async function verifyGoogleToken(req, res, next) {
  try {
    const token = req.body.credential
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Replace CLIENT_ID with your actual client ID
    });
    const payload = ticket.getPayload();
    // Check if the user's email is verified and any other necessary checks
    if (payload.email_verified) {
      return next();
    } else {
      throw new UnauthorizedError();
    }
  } catch (err) {
    return next(err)
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  verifyGoogleToken
};