import express from "express";
import {
  getCurrentUser,
  handleForcedPasswordReset,
  handleUserLogin,
  handleUserLogout,
} from "../controllers/authController.js";
import { ensureAuthenticated, checkForToken } from "../middlewares/auth.js";
const router = express.Router();

//GET
router.get("/me", checkForToken, ensureAuthenticated, getCurrentUser);

//POST
router.post("/login", handleUserLogin);
router.post("/reset-password", ensureAuthenticated, handleForcedPasswordReset);
router.post("/logout", handleUserLogout);

export default router;
