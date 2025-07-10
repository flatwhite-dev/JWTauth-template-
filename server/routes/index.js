const UserController = require("../controllers/user-controller");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");

const Router = require("express").Router;
const router = new Router();

router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 4, max: 52 }),
  UserController.registration
);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.get("/activate/:link", UserController.activate);
router.post("/activate/:code", UserController.activateByCode);

router.get("/refresh", UserController.refresh);
router.get("/users", authMiddleware, UserController.getUsers);

module.exports = router;
