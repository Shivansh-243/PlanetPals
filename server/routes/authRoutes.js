const Router = require("express");
const { register, login } = require("../controllers/authController");

const router = Router();

router.post("/signup", register);
router.post("/login", login);

module.exports = router;
