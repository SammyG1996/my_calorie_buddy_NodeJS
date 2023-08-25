"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for Logs. */

class Logs {

  /** Find all logs for a specific user.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll(username, date) {
    const result = await db.query(
          `SELECT name,
                  serving_size AS "servingSize",
                  calories, 
                  protein, 
                  carbohydrates AS "carbs",
                  fats, 
                  id
           FROM logs
           WHERE username = $1
           AND date = $2;`, [username, date]
    );

    return result.rows;
  }


  /** Deletes given log item from database using ID number; returns undefined. */

  static async remove(id) {
    let result = await db.query(
          `DELETE
           FROM logs
           WHERE id = $1
           RETURNING name`,
        [id],
    );
    const item = result.rows[0];

    if (!item) throw new NotFoundError(`No Log Found`);
  }

  /** Creates a SQL query to insert of a food log into the applications table 
   * Take 8 params {name, servingSize, calories, protein, carbohydrates, fats, username, date}
   * 
   * If succesful it will insert into the table and return:
   * 
   * {
   * Added : name
   * }
  */

  static async add(name, servingSize, calories, protein, carbohydrates, fats, username, date){


    let result = await db.query(
      `INSERT INTO logs
      (name,
        serving_size, 
        calories, 
        protein, 
        carbohydrates, 
        fats, 
        username, 
        date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING name`,
    [
        name, servingSize, calories, protein, carbohydrates, fats, username, date
    ])

    const res = result.rows[0];

    return res;
  }



}


module.exports = Logs;
