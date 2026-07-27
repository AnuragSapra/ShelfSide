import express from "express";
import {
  handleCreateMember,
  getAllMembers,
  getMemberById,
  updateMember,
  handleDeactivateMember,
  handleReactivateMember,
} from "../controllers/memberController.js";
import { ensureAuthenticated, onlyGrantAccessTo } from "../middlewares/auth.js";

const router = express.Router();

//GET
router.get("/", ensureAuthenticated, onlyGrantAccessTo("admin"), getAllMembers);
router.get(
  "/:memberId",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  getMemberById,
);

//POST
router.post(
  "/",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  handleCreateMember,
);

//PATCH
router.patch(
  "/:memberId/update",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  updateMember,
);

router.patch(
  "/:memberId/reactivate",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  handleReactivateMember,
);

//DELETE
router.delete(
  "/:memberId",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  handleDeactivateMember,
);

export default router;
