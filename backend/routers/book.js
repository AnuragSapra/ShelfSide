import express from "express";
import {
  addNewBook,
  getAllBooks,
  getBookByIsbn,
  handleDeactivateBook,
  handleReactivateBook,
  updateBookDetails,
} from "../controllers/bookController.js";
import { ensureAuthenticated, onlyGrantAccessTo } from "../middlewares/auth.js";

const router = express.Router();

//GET
router.get("/", getAllBooks);
router.get("/:isbn", getBookByIsbn);

//POST
router.post("/", ensureAuthenticated, onlyGrantAccessTo("admin"), addNewBook);

//PATCH
router.patch(
  "/:id/update",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  updateBookDetails,
);

router.patch(
  "/:id/reactivate",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  handleReactivateBook,
);

//DELETE
router.delete(
  "/:id/deactivate",
  ensureAuthenticated,
  onlyGrantAccessTo("admin"),
  handleDeactivateBook,
);

export default router;
