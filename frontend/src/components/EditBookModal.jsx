import { useEffect, useState } from "react";
import { updateBook } from "../api/books";
import toast from "react-hot-toast";
import Button from "./Button";
import Input from "./Input";
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

export default function EditBookModal({ open, book, onClose, onBookUpdated }) {
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    if (!book || !open) return;

    setEditForm({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      publishedYear: book.publishedYear,
      publisher: book.publisher,
      language: book.language,
      pageCount: book.pageCount,
    });
  }, [book, open]);

  async function handleEditSubmit(e) {
    e.preventDefault();
    try {
      setEditSubmitting(true);
      const payload = {
        ...editForm,
        pageCount: Number(editForm.pageCount),
        publishedYear: Number(editForm.publishedYear),
      };
      const response = await updateBook(book._id, payload);
      toast.success(response.data.message || "Book updated.");
      onBookUpdated(response.data.book);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update book.");
    } finally {
      setEditSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#35606B] bg-[#2D545E]
          shadow-xl scrollbar-thin scrollbar-track-[#12343B] scrollbar-thumb-[#C89666] hover:scrollbar-thumb-[#B78355]"
      >
        <div className="p-8">
          <h2 className="mb-6 text-3xl font-bold text-[#E1B382]">Edit Book</h2>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              required
              label="Title"
              name="title"
              value={editForm.title ?? ""}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
            />

            <Input
              required
              label="Author"
              name="author"
              value={editForm.author ?? ""}
              onChange={(e) =>
                setEditForm({ ...editForm, author: e.target.value })
              }
            />

            <TextArea
              required
              label="Description"
              name="description"
              value={editForm.description ?? ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  description: e.target.value,
                })
              }
            />

            <Select
              required
              label="Category"
              name="category"
              value={editForm.category ?? ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  category: e.target.value,
                })
              }
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>

            <Input
              required
              type="number"
              label="Published Year"
              name="publishedYear"
              value={editForm.publishedYear ?? ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  publishedYear: e.target.value,
                })
              }
            />

            <Input
              required
              label="Publisher"
              name="publisher"
              value={editForm.publisher ?? ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  publisher: e.target.value,
                })
              }
            />

            <Input
              required
              label="Language"
              name="language"
              value={editForm.language ?? ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  language: e.target.value,
                })
              }
            />

            <Input
              required
              type="number"
              label="Page Count"
              name="pageCount"
              value={editForm.pageCount ?? ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  pageCount: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                onClick={onClose}
                disabled={editSubmitting}
                className="border border-[#C89666] text-[#E1B382] hover:bg-[#C89666]/20 rounded-lg px-5 py-2"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={editSubmitting}
                loadingText="Saving..."
                className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold rounded-lg px-5 py-2"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
