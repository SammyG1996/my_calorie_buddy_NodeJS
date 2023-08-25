"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Logs = require("../models/logs");
const router = express.Router();
const logAddSchema = require("../schemas/logAdd.json")

/**This allows you to get all the entries */
router.get("/:username/:date", ensureLoggedIn, async function (req, res, next) {
    try {
      const items = await Logs.findAll(req.params.username, req.params.date);
      return res.json({ items });
    } catch (err) {
      return next(err);
    }
  });


  /**This will allow you to add an entry  */
  router.post("/:username", ensureLoggedIn, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, logAddSchema); /**Validates the req.body against the schema validator */
      if (!validator.valid) { /**if its not valid it will reject */
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      /**If it is valid all the feilds are extracted by deconstruction and then passed to helper functions to connect to database */
      const {name, serving_size, calories, protein, carbohydrates, fats, username, date} = req.body 
      const insertion = await Logs.add(name, serving_size, calories, protein, carbohydrates, fats, username, date)
      return res.status(201).json({"success" : insertion}) /**if successful a response is sent back */

    } catch (err) {
      return next(err);
    }
  });

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login
 **/

router.delete("/:username/:id", ensureLoggedIn, async function (req, res, next) {
    try {
      await Logs.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  });



  module.exports = router;