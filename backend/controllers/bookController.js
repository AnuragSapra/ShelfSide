import Book from "../models/book.js";

export async function getAllBooks(req, res) {
  try {
    const { search, category, availableOnly, sortBy } = req.query;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 12);

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (availableOnly === "true") {
      filter.availableCopies = { $gt: 0 };
    }

    let sortQuery = { createdAt: -1, _id: 1 };

    if (sortBy === "title_asc") {
      sortQuery = { title: 1, _id: 1 };
    } else if (sortBy === "title_desc") {
      sortQuery = { title: -1, _id: 1 };
    } else if (sortBy === "oldest") {
      sortQuery = { createdAt: 1, _id: 1 };
    } else if (sortBy === "popular") {
      sortQuery = { timesBorrowed: -1, _id: 1 };
    }

    const skip = (page - 1) * limit;

    const [books, totalBooks] = await Promise.all([
      Book.find(filter).sort(sortQuery).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalBooks / limit);

    return res.json({
      books,
      totalBooks,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Couldn't fetch books catalog data." });
  }
}

export async function getBookByIsbn(req, res) {
  const rawIsbn = req.params.isbn;
  if (!rawIsbn) {
    return res.status(404).json({ message: "ISBN param is required" });
  }

  const isbn = rawIsbn.replace(/[- ]/g, "");

  try {
    const book = await Book.findOne({ isbn });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json({ book });
  } catch (error) {
    return res.status(500).json({ message: "Couldn't fetch book" });
  }
}

export async function addNewBook(req, res) {
  const {
    title,
    author,
    isbn,
    description,
    coverImage,
    category,
    publishedYear,
    publisher,
    language,
    pageCount,
    totalCopies,
  } = req.body;
  try {
    if (
      !title ||
      !author ||
      !isbn ||
      !coverImage ||
      !category ||
      !publishedYear
    ) {
      return res.status(400).json({
        message: "All fields are mandatory.",
      });
    }
    const newBook = await Book.create({
      title,
      author,
      isbn,
      description,
      coverImage,
      category,
      publishedYear,
      publisher,
      language,
      pageCount,
      totalCopies,
    });
    return res.status(201).json({
      message: "New book added succesfully",
      book: newBook,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: `Database Conflict: A book with ISBN identifier '${isbn}' already exists in this system.`,
      });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function handleDeactivateBook(req, res) {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book record not found.",
      });
    }
    book.totalCopies = 0;
    book.availableCopies = 0;
    book.isActive = false;

    await book.save();

    return res.status(200).json({
      message:
        "Book has been successfully removed from active circulation inventory.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function handleReactivateBook(req, res) {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book record not found.",
      });
    }

    if (book.isActive) {
      return res.status(400).json({
        message: "Book is already active.",
      });
    }

    const { totalCopies } = req.body;

    if (!totalCopies || totalCopies < 1) {
      return res.status(400).json({
        message:
          "A valid totalCopies value is required to reactivate this book.",
      });
    }

    book.totalCopies = totalCopies;
    book.availableCopies = totalCopies;
    book.isActive = true;

    await book.save();

    return res.status(200).json({
      message:
        "Book has been successfully restored to active circulation inventory.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function updateBookDetails(req, res) {
  const id = req.params.id;

  const {
    title,
    author,
    description,
    coverImage,
    category,
    publishedYear,
    publisher,
    language,
    pageCount,
    totalCopies,
  } = req.body;

  const updateFields = {
    title,
    author,
    description,
    coverImage,
    category,
    publishedYear,
    publisher,
    language,
    pageCount,
  };

  Object.keys(updateFields).forEach((key) => {
    if (updateFields[key] === undefined) delete updateFields[key];
  });

  try {
    const update = { $set: updateFields };

    if (totalCopies !== undefined) {
      const currentBook = await Book.findById(id);
      if (!currentBook) {
        return res.status(404).json({ message: "Book not found" });
      }

      const diff = totalCopies - currentBook.totalCopies;

      if (currentBook.availableCopies + diff < 0) {
        return res.status(400).json({
          message:
            "Cannot decrease total copies below the amount currently checked out by members.",
        });
      }

      updateFields.totalCopies = totalCopies;
      update.$inc = { availableCopies: diff };
    }

    const updatedBook = await Book.findByIdAndUpdate(id, update, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res
      .status(200)
      .json({ message: "Book updated successfully.", book: updatedBook });
  } catch (error) {
    return res.status(500).json({ message: "Couldn't update book details." });
  }
}
