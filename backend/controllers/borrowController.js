import Borrow from "../models/borrow.js";
import Book from "../models/book.js";
import User from "../models/user.js";

export async function handleRequestBook(req, res) {
  const { bookId } = req.body;
  const userId = req.user.id;
  const MAX_BORROW_LIMIT = 3;

  if (!bookId) {
    return res.status(400).json({
      message: "Book reference Id is required to process the request.",
    });
  }

  try {
    const activeRequest = await Borrow.findOne({
      user: userId,
      book: bookId,
      status: { $in: ["pending", "approved", "ready", "collected"] },
    });
    if (activeRequest) {
      return res.status(400).json({
        message: "You already have an active request for this book.",
      });
    }

    const activeBorrows = await Borrow.countDocuments({
      user: userId,
      status: {
        $in: ["pending", "approved", "ready", "collected"],
      },
    });

    if (activeBorrows >= MAX_BORROW_LIMIT) {
      return res.status(400).json({
        message: `You have reached the maximum borrow limit of ${MAX_BORROW_LIMIT} books.`,
      });
    }

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({
        message: "This book is currently unavailable",
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        message:
          "All physical copies of this book are currently checked out by other members.",
      });
    }

    const borrowRecord = await Borrow.create({
      user: userId,
      book: bookId,
      status: "pending",
    });

    return res.status(201).json({
      message:
        "Your borrow request has been successfully submitted to the librarian review queue.",
      borrow: borrowRecord,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error handling borrowing request." });
  }
}

export async function handleCancelRequest(req, res) {
  const { borrowId } = req.params;
  const userId = req.user.id;
  try {
    const request = await Borrow.findById(borrowId);
    if (!request || request.status !== "pending") {
      return res.status(400).json({
        message: "You cannot cancel this request.",
      });
    }

    if (request.user.toString() !== userId) {
      return res.status(403).json({
        message: "Forbidden: You can only cancel your own hold requests.",
      });
    }

    request.status = "cancelled";
    await request.save();

    return res.status(200).json({
      message: "Request cancelled successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function getMemberBorrows(req, res) {
  const userId = req.user.id;
  const { view } = req.query;

  const activeStatuses = ["pending", "approved", "ready", "collected"];
  const historyStatuses = ["returned", "rejected", "cancelled"];

  const isHistory = view === "history";
  const page = isHistory ? Math.max(1, parseInt(req.query.page) || 1) : 1;
  const limit = isHistory ? Math.max(1, parseInt(req.query.limit) || 10) : 100;
  const skip = isHistory ? (page - 1) * limit : 0;

  const filter = {
    user: userId,
    status: { $in: view === "history" ? historyStatuses : activeStatuses },
  };

  try {
    const [borrows, totalBorrows] = await Promise.all([
      Borrow.find(filter)
        .populate({
          path: "book",
          select: "title author coverImage category isbn",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Borrow.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalBorrows / limit);

    return res
      .status(200)
      .json({ borrows, totalBorrows, totalPages, currentPage: page });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function handleApproveRequest(req, res) {
  const { borrowId } = req.params;
  const librarianId = req.user.id;

  try {
    const request = await Borrow.findById(borrowId);

    if (!request || request.status !== "pending") {
      return res.status(400).json({
        message: "No valid pending request found.",
      });
    }

    const assignedBook = await Book.findOneAndUpdate(
      { _id: request.book, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true },
    );

    if (!assignedBook) {
      request.status = "rejected";
      request.rejectionReason =
        "All available shelf copies were checked out before evaluation processing was completed.";
      await request.save();
      return res.status(400).json({
        message: "Inventory empty. Reservation has been auto-rejected.",
      });
    }

    request.status = "approved";
    request.approvedAt = new Date();
    request.approvedBy = librarianId;

    await request.save();
    return res.status(200).json({
      message: "Request approved.",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function handleRejectRequest(req, res) {
  const { borrowId } = req.params;
  const { rejectionReason } = req.body;
  const librarianId = req.user.id;

  if (!rejectionReason || rejectionReason.trim() === "") {
    return res.status(400).json({
      message: "An explicit rejection reason is mandatory.",
    });
  }

  try {
    const request = await Borrow.findById(borrowId);
    if (!request || request.status !== "pending") {
      return res.status(400).json({
        message: "No valid pending borrow requests match the id.",
      });
    }

    request.status = "rejected";
    request.rejectionReason = rejectionReason.trim();
    request.rejectedBy = librarianId;

    await request.save();
    return res.status(200).json({
      message: "Borrow request successfully rejected and archived.",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function handleMarkReady(req, res) {
  const { borrowId } = req.params;

  try {
    const request = await Borrow.findById(borrowId);

    if (!request || request.status !== "approved") {
      return res.status(400).json({
        message: "No valid approved request found.",
      });
    }

    request.status = "ready";
    request.readyAt = new Date();
    const holdDeadline = new Date();
    holdDeadline.setDate(holdDeadline.getDate() + 3);
    request.pickupDeadline = holdDeadline;

    await request.save();
    return res.status(200).json({
      message: "Book has been prepared for pickup",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function handleMarkCollected(req, res) {
  const { borrowId } = req.params;

  try {
    const request = await Borrow.findById(borrowId);

    if (!request || request.status !== "ready") {
      return res.status(400).json({
        message: "No valid ready request found.",
      });
    }

    request.status = "collected";
    request.collectedAt = new Date();

    const calculatedDueDate = new Date();
    calculatedDueDate.setDate(calculatedDueDate.getDate() + 14);

    request.dueDate = calculatedDueDate;

    await Promise.all([
      request.save(),
      User.findByIdAndUpdate(request.user, {
        $push: { currentBorrowedBooks: request.book },
      }),
      Book.findByIdAndUpdate(request.book, {
        $inc: { timesBorrowed: 1 },
      }),
    ]);

    return res.status(200).json({
      message: "Book successfully checked out from Shelfside inventory.",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function handleMarkReturned(req, res) {
  const { borrowId } = req.params;

  try {
    const request = await Borrow.findById(borrowId);

    if (!request || request.status !== "collected") {
      return res.status(400).json({
        message: "No valid collected request found.",
      });
    }

    const today = new Date();
    request.returnedAt = today;
    request.status = "returned";

    if (today > request.dueDate) {
      const millisecondsLate = today.getTime() - request.dueDate.getTime();
      const numericalDaysLate = Math.ceil(
        millisecondsLate / (1000 * 60 * 60 * 24),
      );
      request.fine = numericalDaysLate * 2;
    }

    await Promise.all([
      request.save(),
      Book.findByIdAndUpdate(request.book, { $inc: { availableCopies: 1 } }),
      User.findByIdAndUpdate(request.user, {
        $pull: { currentBorrowedBooks: request.book },
      }),
    ]);

    return res.status(200).json({
      message:
        request.fine > 0
          ? `Book drop-off complete. Rental period exceeded by limits. Late fee processing required: $${request.fine}.`
          : "Book processed and returned successfully with no pending overdue accounts.",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function getAllMembersBorrows(req, res) {
  try {
    const { status, member, page: pageQuery, limit: limitQuery } = req.query;

    const filter = {};

    if (status) {
      filter.status = status.includes(",")
        ? { $in: status.split(",") }
        : status;
    }

    if (member) {
      filter.user = member;
    }

    const page = Math.max(1, parseInt(pageQuery) || 1);
    const limit = Math.max(1, parseInt(limitQuery) || 10);
    const skip = (page - 1) * limit;

    const [borrows, totalBorrows] = await Promise.all([
      Borrow.find(filter)
        .populate(
          "user",
          "name memberId email phone createdAt isActive currentBorrowedBooks",
        )
        .populate("book", "title author coverImage isbn")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Borrow.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalBorrows / limit);

    return res
      .status(200)
      .json({ borrows, totalBorrows, totalPages, currentPage: page });
  } catch (error) {
    return res.status(500).json({ message: "Couldn't fetch borrows." });
  }
}
