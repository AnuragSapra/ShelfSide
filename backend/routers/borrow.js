import express from "express";

import {
  handleRequestBook,
  handleCancelRequest,
  getMemberBorrows,
  handleApproveRequest,
  handleRejectRequest,
  handleMarkReady,
  handleMarkCollected,
  handleMarkReturned,
  getAllMembersBorrows,
} from "../controllers/borrowController.js";
import { ensureAuthenticated, onlyGrantAccessTo } from "../middlewares/auth.js";

const router = express.Router();

//GET
router.get("/my-borrows", ensureAuthenticated, getMemberBorrows);
router.get(
  "/all-borrows",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  getAllMembersBorrows,
);

//POST
router.post("/request", ensureAuthenticated, handleRequestBook);

//PATCH
router.patch("/:borrowId/cancel", ensureAuthenticated, handleCancelRequest);
router.patch(
  "/:borrowId/approve",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  handleApproveRequest,
);
router.patch(
  "/:borrowId/reject",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  handleRejectRequest,
);
router.patch(
  "/:borrowId/ready",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  handleMarkReady,
);
router.patch(
  "/:borrowId/collected",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  handleMarkCollected,
);
router.patch(
  "/:borrowId/returned",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  handleMarkReturned,
);

export default router;
