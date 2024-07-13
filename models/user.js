/** User class for message.ly */

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");
const Message = require("./message");
/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );
    await User.updateLoginTimestamp(username);
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT username, password FROM users
      WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];
    if (!user) {
      return false;
    }
    const isValid = await bcrypt.compare(password, user.password);
    return isValid;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try {
      const result = await db.query(
        `UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE username = $1`,
        [username]
      );
      if (result.rows.length === 0) {
        throw new ExpressError(`No username '${username} exists`, 404);
      }
      return result.rows[0];
    } catch (err) {
      throw new ExpressError("Updating login timestamp failed", 500);
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    try {
      const results = await db.query(
        `SELECT username, first_name, last_name, phone FROM users`
      );
      return results.rows;
    } catch (err) {
      throw new ExpressError("Something went wrong", 500);
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    try {
      const result = await db.query(
        `SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users
        WHERE username = $1`,
        [username]
      );
      if (result.rows.length === 0) {
        return new ExpressError(`No user could be found for ${username}.`, 404);
      }
      return result.rows[0];
    } catch (err) {
      throw new ExpressError("There was a problem with retrieving ");
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    try {
      const results = await db.query(
        `SELECT m.id, m.to_username, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone
        FROM messages AS m
        JOIN users AS u ON m.to_username = u.username
        WHERE m.from_username = $1`,
        [username]
      );
      if (results.rows.length === 0) {
        throw new ExpressError(`No username '${username} exists`, 404);
      }
      return results.rows.map((row) => ({
        id: row.id,
        to_user: {
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          phone: row.phone,
        },
        body: row.body,
        sent_at: row.sent_at,
        read_at: row.read_at,
      }));
    } catch (err) {
      throw new ExpressError(
        "There was a problem retrieving the messages.",
        500
      );
    }
  }
  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    try {
      const results = await db.query(
        `SELECT m.id, m.body, m.sent_at, m.read_at,
              u.username, u.first_name, u.last_name, u.phone
       FROM messages AS m
       JOIN users AS u ON m.from_username = u.username
       WHERE m.to_username = $1`,
        [username]
      );
      if (results.rows.length === 0) {
        throw new ExpressError(`Username '${username} doesn't exist`, 404);
      }

      return results.rows.map((row) => ({
        id: row.id,
        from_user: {
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          phone: row.phone,
        },
        body: row.body,
        sent_at: row.sent_at,
        read_at: row.read_at,
      }));
    } catch (err) {
      throw new ExpressError(
        "There was a problem with retrieving the messages.",
        500
      );
    }
  }
}

module.exports = User;
