const { signInAndSignUp } = require("../controllers/accountController");
const router = require("express").Router();

//REGISTER AND LOGIN
router.put("/signInAndSignUp/:email", signInAndSignUp);

module.exports = router;
