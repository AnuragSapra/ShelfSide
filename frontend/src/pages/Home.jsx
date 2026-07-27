import { useEffect, useState } from "react";
import { getAllBooks } from "../api/books.js";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AddBookModal from "../components/AddBookModal.jsx";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import Select from "../components/Select";
import BookCard from "../components/BookCard.jsx";

const CATEGORIES = [
  "Biography",
  "Business",
  "Classic Literature",
  "Fantasy",
  "Fiction",
  "History",
  "Mystery",
  "Non-Fiction",
  "Psychology",
  "Romance",
  "Science",
  "Science Fiction",
  "Technology",
  "Thriller",
];

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useContext(AuthContext);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchBooks();
  }, [debouncedSearch, category, availableOnly, sortBy, page]);

  async function fetchBooks() {
    setLoading(true);
    try {
      const response = await getAllBooks({
        search: debouncedSearch || undefined,
        category: category || undefined,
        availableOnly: availableOnly ? "true" : undefined,
        sortBy: sortBy || undefined,
        page,
        limit: 12,
      });
      setBooks(response.data.books);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error("Failed to load books.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#12343B] text-[#F8F8F6]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-extra bold tracking-tight text-[#E1B382]">
            Discover your next read...
          </h1>
          {user?.role === "admin" && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold px-6 py-3 rounded-lg transition"
            >
              + Add New Book
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-5 mb-8 items-end bg-[#12343B] pb-6 ">
          <Input
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="flex-1 min-w-87.5"
          />

          <div className="flex flex-wrap items-center gap-4">
            <Select
              containerClassName="sm:w-56"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Select
              containerClassName="sm:w-56"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
              <option value="popular">Most Popular</option>
            </Select>

            <label className="flex items-center gap-3 text-[#D7C3A5] whitespace-nowrap">
              <input
                type="checkbox"
                className="accent-[#C89666] "
                checked={availableOnly}
                onChange={(e) => {
                  setAvailableOnly(e.target.checked);
                  setPage(1);
                }}
              />
              Available only
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24 text-center text-[#C7D3D7] text-lg animate-pulse">
            Loading books...
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 text-[#C7D3D7]">
            No books matched your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 transition-all duration-200">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-5 mt-10">
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="border border-[#C89666] bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold
                    rounded-lg px-5 py-2"
            >
              <ArrowLeft size={16} />
              <span>Prev</span>
            </Button>
            <span className="rounded-lg bg-[#2D545E] px-5 py-2 text-[#F8F8F6] font-medium mx-10">
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border border-[#C89666] bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold
                    rounded-lg px-5 py-2"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {showAddModal && (
          <AddBookModal
            onClose={() => setShowAddModal(false)}
            onBookAdded={fetchBooks}
          />
        )}
      </div>
    </div>
  );
}
