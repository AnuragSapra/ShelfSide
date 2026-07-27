import { useEffect, useState } from "react";
import { getAllMembersBorrows } from "../api/borrows";
import toast from "react-hot-toast";
import Button from "./Button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BorrowHistoryModal({ open, member, onBack }) {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!open || !member) return;

    setBorrows([]);
    setTotalPages(1);

    async function fetchHistory() {
      setLoading(true);

      try {
        const response = await getAllMembersBorrows({
          member: member._id,
          page,
        });

        setBorrows(response.data.borrows);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Couldn't fetch borrow history.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [open, member, page]);

  useEffect(() => {
    if (open) {
      setPage(1);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-5xl min-h-162.5 max-h-[90vh] overflow-y-auto rounded-2xl
      border border-[#35606B] bg-[#2D545E] shadow-xl
      scrollbar-thin
      scrollbar-track-[#12343B]
      scrollbar-thumb-[#C89666]
      hover:scrollbar-thumb-[#B78355]"
      >
        <div className="border-b border-[#35606B] px-6 py-5">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 font-medium text-[#E1B382] transition hover:text-[#C89666]"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <h2 className="mt-3 text-2xl font-semibold text-[#E1B382]">
            Borrow History
          </h2>

          <p className="mt-1 text-sm text-[#B7C3C7]">
            {member?.name} ({member?.memberId})
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-[#B7C3C7]">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-[#4B7079] text-[#E1B382]">
                <tr>
                  <th className="py-3 text-left font-semibold">Title</th>
                  <th className="py-3 text-left font-semibold">Author</th>
                  <th className="py-3 text-left font-semibold">Borrowed On</th>
                  <th className="py-3 text-left font-semibold">Returned On</th>
                  <th className="py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {borrows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-[#B7C3C7]"
                    >
                      No borrow history found.
                    </td>
                  </tr>
                ) : (
                  borrows.map((borrow) => {
                    const statusColor =
                      {
                        pending: "bg-yellow-500",
                        approved: "bg-blue-500",
                        ready: "bg-cyan-500",
                        collected: "bg-green-500",
                        returned: "bg-gray-500",
                        rejected: "bg-red-500",
                      }[borrow.status] || "bg-gray-400";

                    return (
                      <tr
                        key={borrow._id}
                        className="border-b border-[#3C626B] hover:bg-[#365E68] transition"
                      >
                        <td className="max-w-xs py-4" title={borrow.book.title}>
                          <Link
                            to={`/books/${borrow.book.isbn}`}
                            className="hover:text-[#E1B382] transition"
                          >
                            {borrow.book.title}
                          </Link>
                        </td>

                        <td className="py-4 text-[#C7D3D7]">
                          {borrow.book.author}
                        </td>

                        <td className="py-4 text-[#C7D3D7]">
                          {borrow.collectedAt
                            ? new Date(borrow.collectedAt).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="py-4 text-[#C7D3D7]">
                          {borrow.returnedAt
                            ? new Date(borrow.returnedAt).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="py-4">
                          <span
                            className={`inline-block h-2 w-2 rounded-full mr-2 ${statusColor}`}
                          />
                          <span className="capitalize">{borrow.status}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-5">
              <Button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold rounded-lg px-5 py-2"
              >
                Previous
              </Button>

              <span className="rounded-lg bg-[#12343B] px-4 py-2 text-[#F8F8F6]">
                {page} / {totalPages}
              </span>

              <Button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold rounded-lg px-5 py-2"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
