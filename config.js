/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();
const DB_USER = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_URI = (process.env.NODE_ENV === "test")
  ? `postgresql://${DB_USER}:${DB_PASSWORD}@localhost/messagely_test`
  : `postgresql://${DB_USER}:${DB_PASSWORD}@localhost/messagely`;

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};