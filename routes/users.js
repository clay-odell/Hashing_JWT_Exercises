const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { ensureLoggedIn } = require("../middleware/auth");
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async function (req, res, next) {
  try {
    const users = await User.all();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", async function (req, res, next) {
  try {
    const username = req.params.username;
    const user = await User.get(username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', async function (req, res, next) {
    try {
        const username = req.params.username;
        const userMessagesTo = await User.messagesTo(username);
        return res.json({ userMessagesTo });
        
    } catch (err) {
        return next(err);
    }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', async function (req, res, next) {
    try {
        const username = req.params.username;
        const messagesFromUser = await User.messagesFrom(username);
        return res.json({ messagesFromUser });
    } catch (err) {
        return next(err);
    }
});
module.exports = router;
