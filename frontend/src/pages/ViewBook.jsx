import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getBookByIsbn, deactivateBook, reactivateBook } from "../api/books";
import { getMyBorrows, requestBook, cancelRequest } from "../api/borrows";
import Button from "../components/Button";
import toast from "react-hot-toast";
import EditBookModal from "../components/EditBookModal";

export default function ViewBook() {
  const { user } = useContext(AuthContext);
  const { isbn } = useParams();
  const [book, setBook] = useState(null);
  const [borrowId, setBorrowId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [borrowStatus, setBorrowStatus] = useState(null);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    async function fetchBook() {
      setLoading(true);

      try {
        const response = await getBookByIsbn(isbn);
        setBook(response.data.book);
      } catch (error) {
        toast.error(error.response?.data?.message || "Couldn't load book.");
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [isbn]);

  useEffect(() => {
    if (!book || !user || user.role !== "member") {
      setBorrowStatus(null);
      setBorrowId(null);
      return;
    }

    async function fetchBorrowStatus() {
      try {
        const borrowResponse = await getMyBorrows();

        const existing = borrowResponse.data.borrows.find(
          (b) =>
            b.book._id === book._id &&
            ["pending", "approved", "ready", "collected"].includes(b.status),
        );

        if (existing) {
          setBorrowStatus(existing.status);
          setBorrowId(existing._id);
        } else {
          setBorrowStatus(null);
          setBorrowId(null);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchBorrowStatus();
  }, [book, user]);

  if (loading) {
    return <div className="container mt-5">Loading...</div>;
  }
  if (!book) {
    return <div className="container mt-5">Book not found.</div>;
  }

  async function handleRequest() {
    setRequesting(true);
    try {
      const response = await requestBook({ bookId: book._id });
      setBorrowId(response.data.borrow._id);
      setBorrowStatus("pending");
      toast.success("Borrow request sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't request book.");
    } finally {
      setRequesting(false);
    }
  }

  async function handleCancel() {
    setRequesting(true);
    try {
      await cancelRequest(borrowId);
      setBorrowStatus(null);
      setBorrowId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't cancel request.");
    } finally {
      setRequesting(false);
    }
  }

  async function handleDeactivate() {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this book? It will be removed from active circulation.",
    );
    if (!confirmed) return;

    try {
      setAdminActionLoading(true);
      const response = await deactivateBook(book._id);
      toast.success(response.data.message);
      setBook((prev) => ({
        ...prev,
        isActive: false,
        totalCopies: 0,
        availableCopies: 0,
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to deactivate book.",
      );
    } finally {
      setAdminActionLoading(false);
    }
  }

  async function handleReactivate() {
    const input = window.prompt(
      "Enter total copies to restore this book with:",
    );
    if (input === null) return;

    const totalCopies = Number(input);
    if (!Number.isInteger(totalCopies) || totalCopies < 1) {
      toast.error("Please enter a valid number of copies (1 or more).");
      return;
    }

    try {
      setAdminActionLoading(true);
      const response = await reactivateBook(book._id, totalCopies);
      toast.success(response.data.message);
      setBook((prev) => ({
        ...prev,
        isActive: true,
        totalCopies,
        availableCopies: totalCopies,
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reactivate book.",
      );
    } finally {
      setAdminActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#12343B] text-[#F8F8F6]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-10 bg-[#2D545E] rounded-2xl p-8 shadow-xl">
          <div className="flex justify-center items-start">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full max-w-xs rounded-xl object-contain shadow-2xl"
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h1 className="text-5xl font-bold text-[#E1B382]">{book.title}</h1>
            <p className="text-xl text-[#C7D3D7]">{book.author}</p>
            <div>
              <h2 className="text-lg font-semibold mb-2 text-[#E1B382]">
                Description
              </h2>

              <p
                className="leading-8 text-[#D5DDDF]"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {book.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-[#C89666]">ISBN:</p>
                <p>{book.isbn}</p>
              </div>
              <div>
                <p className="text-sm text-[#C89666]">Category:</p>
                <p>{book.category}</p>
              </div>
              <div>
                <p className="text-sm text-[#C89666]">Published Year:</p>
                <p>{book.publishedYear}</p>
              </div>
              <div>
                <p className="text-sm text-[#C89666]">Publisher:</p>
                <p>{book.publisher}</p>
              </div>
              <div>
                <p className="text-sm text-[#C89666]">Language:</p>
                <p>{book.language}</p>
              </div>
              <div>
                <p className="text-sm text-[#C89666]">Pages:</p>
                <p>{book.pageCount || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-[#C89666]">Total Copies:</p>
                <p>{book.totalCopies}</p>
              </div>
              <div>
                <p className="text-sm text-[#C89666]">Available Copies:</p>
                <p>{book.availableCopies}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {user && user.role === "member" && (
                <div className="flex flex-wrap items-center gap-3">
                  {borrowStatus === null && (
                    <Button
                      disabled={requesting}
                      onClick={handleRequest}
                      loadingText="Requesting..."
                      className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold px-6 py-2 rounded-lg transition"
                    >
                      Borrow
                    </Button>
                  )}
                  {borrowStatus === "pending" && (
                    <>
                      <span className="rounded-full bg-yellow-600/20 text-yellow-300 px-4 py-2">
                        Pending Approval
                      </span>
                      <Button
                        onClick={handleCancel}
                        loadingText="Cancelling..."
                      >
                        Cancel Request
                      </Button>
                    </>
                  )}
                  {borrowStatus === "approved" && (
                    <span className="rounded-full bg-blue-600/20 text-blue-300 px-4 py-2">
                      Approved
                    </span>
                  )}
                  {borrowStatus === "ready" && (
                    <span className="rounded-full bg-green-700/20 text-green-400 px-4 py-2">
                      Ready for Pickup
                    </span>
                  )}
                  {borrowStatus === "collected" && (
                    <span className="rounded-full bg-[#C89666]/20 text-[#E1B382] px-4 py-2">
                      Currently Borrowed
                    </span>
                  )}
                </div>
              )}
              {user && user.role === "admin" && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setShowEditModal(true)}
                    className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold px-6 py-2 rounded-lg transition"
                  >
                    Edit Book
                  </Button>

                  {book.isActive ? (
                    <Button
                      onClick={handleDeactivate}
                      disabled={adminActionLoading}
                      loadingText="Deactivating..."
                      className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      onClick={handleReactivate}
                      disabled={adminActionLoading}
                      loadingText="Reactivating..."
                      className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              )}
            </div>
            <EditBookModal
              open={showEditModal}
              book={book}
              onClose={() => setShowEditModal(false)}
              onBookUpdated={setBook}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
