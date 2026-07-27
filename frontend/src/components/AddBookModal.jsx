import { useState } from "react";
import toast from "react-hot-toast";
import { addNewBook } from "../api/books.js";
import Input from "./Input";
import Button from "./Button";
import TextArea from "./TextArea";
import Select from "./Select";

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

const EMPTY_FORM = {
  title: "",
  author: "",
  isbn: "",
  description: "",
  coverImage: "",
  category: "",
  publishedYear: "",
  publisher: "",
  language: "",
  pageCount: "",
  totalCopies: "",
};

export default function AddBookModal({ onClose, onBookAdded }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        publishedYear: Number(form.publishedYear),
        pageCount: Number(form.pageCount),
        totalCopies: Number(form.totalCopies),
      };

      const response = await addNewBook(payload);

      toast.success(response.data.message || "Book added.");
      setForm(EMPTY_FORM);
      onBookAdded?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add book.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#35606B] bg-[#2D545E]
          shadow-xl scrollbar-track-[#2D545E] scrollbar-thumb-[#C89666] hover:scrollbar-thumb-[#B78355]
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-r-2xl"
      >
        <div className="sticky top-0 border-b border-[#35606B] bg-[#2D545E] px-8 py-5">
          <h2 className="text-2xl font-bold text-[#E1B382]">Add New Book</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8">
          <div className="grid md:grid-cols-2 gap-5">
            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <Input
              label="Author"
              name="author"
              value={form.author}
              onChange={handleChange}
              required
            />

            <Input
              label="ISBN"
              name="isbn"
              value={form.isbn}
              onChange={handleChange}
              placeholder="9780141439518"
              required
            />
          </div>

          <TextArea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter a short description..."
            required
          />

          <Input
            label="Cover Image URL"
            name="coverImage"
            value={form.coverImage}
            onChange={handleChange}
            placeholder="https://..."
            required
          />

          <div className="grid md:grid-cols-2 gap-5">
            <Select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>

              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>

            <Input
              label="Published Year"
              name="publishedYear"
              type="number"
              value={form.publishedYear}
              onChange={handleChange}
              min="1000"
              max={new Date().getFullYear()}
              required
            />

            <Input
              label="Publisher"
              name="publisher"
              value={form.publisher}
              onChange={handleChange}
              required
            />

            <Input
              label="Language"
              name="language"
              value={form.language}
              onChange={handleChange}
              required
            />

            <Input
              label="Page Count"
              name="pageCount"
              type="number"
              value={form.pageCount}
              onChange={handleChange}
              min="1"
              required
            />

            <Input
              label="Total Copies"
              name="totalCopies"
              type="number"
              value={form.totalCopies}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-[#35606B] pt-6">
            <Button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="border border-[#C89666] bg-transparent text-[#E1B382] hover:bg-[#C89666]/20 px-6 py-2 rounded-lg"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting}
              loadingText="Adding..."
              className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold px-6 py-2 rounded-lg"
            >
              Add Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
