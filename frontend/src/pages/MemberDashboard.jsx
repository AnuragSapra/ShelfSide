import { useEffect, useState } from "react";
import { getMyBorrows, cancelRequest } from "../api/borrows";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/Button";

const STATUS_COLORS = {
  pending: "bg-yellow-500",
  cancelled: "bg-gray-400",
  approved: "bg-blue-500",
  ready: "bg-cyan-500",
  collected: "bg-green-500",
  returned: "bg-gray-500",
  rejected: "bg-red-500",
};

export default function MemberDashboard() {
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);

  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchActiveBorrows();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [historyPage]);

  async function fetchActiveBorrows() {
    setLoadingActive(true);
    try {
      const res = await getMyBorrows({ view: "active" });
      setActiveBorrows(res.data.borrows);
    } catch (error) {
      toast.error("Failed to load active borrows.");
    } finally {
      setLoadingActive(false);
    }
  }

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const res = await getMyBorrows({
        view: "history",
        page: historyPage,
        limit: 10,
      });
      setHistory(res.data.borrows);
      setHistoryTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Failed to load borrow history.");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleCancel(borrowId) {
    setCancellingId(borrowId);
    try {
      await cancelRequest(borrowId);
      toast.success("Request cancelled.");
      await fetchActiveBorrows();
      await fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#12343B] text-[#F8F8F6]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-[#E1B382] mb-10">
          My Dashboard
        </h1>

        <section className="mb-10">
          <div className="bg-[#2D545E] rounded-2xl border border-[#35606B] p-6">
            <h2 className="text-lg font-semibold mb-3">Active Borrows</h2>
            <h2 className="text-2xl font-semibold text-[#E1B382] mb-6">
              Active Borrows
            </h2>
            {loadingActive ? (
              <div className="py-10 text-center text-[#B7C3C7]">Loading...</div>
            ) : activeBorrows.length === 0 ? (
              <div className="py-10 text-center text-[#B7C3C7]">
                No active borrows.
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-[#4B7079] text-[#E1B382]">
                  <tr className="border-b text-left">
                    <th className="py-3 text-left font-semibold">Cover</th>
                    <th className="py-3 text-left font-semibold">Title</th>
                    <th className="py-3 text-left font-semibold">Status</th>
                    <th className="py-3 text-left font-semibold">Due Date</th>
                    <th className="py-3 px-3 text-left font-semibold w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeBorrows.map((b) => {
                    const statusColor = STATUS_COLORS[b.status];
                    return (
                      <tr
                        key={b._id}
                        className="border-b border-[#3C626B] hover:bg-[#365E68] transition"
                      >
                        <td className="py-4">
                          <img
                            src={b.book.coverImage}
                            alt={b.book.title}
                            className="w-12 h-16 rounded object-cover"
                          />
                        </td>
                        <td className="py-4">
                          <Link
                            to={`/books/${b.book.isbn}`}
                            className="hover:text-[#E1B382] transition"
                          >
                            {b.book.title}
                          </Link>
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-block h-2 w-2 rounded-full mr-2 ${statusColor}`}
                          />
                          <span className="capitalize">{b.status}</span>
                        </td>
                        <td className="py-4 text-[#C7D3D7]">
                          {b.dueDate
                            ? new Date(b.dueDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-4">
                          {b.status === "pending" && (
                            <Button
                              className="bg-transparent border border-red-400 text-red-300 hover:bg-red-500/50 hover:text-white px-5 py-2 rounded-lg transition-colors"
                              disabled={cancellingId === b._id}
                              onClick={() => handleCancel(b._id)}
                              loadingText="Cancelling..."
                            >
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <div className="bg-[#2D545E] rounded-2xl border border-[#35606B] p-6">
            <h2 className="text-2xl font-semibold text-[#E1B382] mb-6">
              Borrow History
            </h2>
            {loadingHistory ? (
              <div className="py-10 text-center text-[#B7C3C7]">Loading...</div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center text-[#B7C3C7]">
                No borrow history yet.
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="border-b border-[#4B7079] text-[#E1B382]">
                    <tr className="border-b border-[#3C626B] hover:bg-[#365E68] transition">
                      <th className="py-3 text-left font-semibold">Cover</th>
                      <th className="py-3 text-left font-semibold">Title</th>
                      <th className="py-3 text-left font-semibold">Status</th>
                      <th className="py-3 text-left font-semibold">
                        Returned On
                      </th>
                      <th className="py-3 text-left font-semibold">Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((b) => {
                      const statusColor = STATUS_COLORS[b.status];
                      return (
                        <tr key={b._id} className="border-b">
                          <td className="py-4">
                            <img
                              src={b.book.coverImage}
                              alt={b.book.title}
                              className="w-12 h-16 rounded object-cover"
                            />
                          </td>
                          <td className="py-4">
                            <Link
                              to={`/books/${b.book.isbn}`}
                              className="hover:text-[#E1B382] transition"
                            >
                              {b.book.title}
                            </Link>
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-block h-2 w-2 rounded-full mr-2 ${statusColor}`}
                            />
                            <span className="capitalize">{b.status}</span>
                          </td>
                          <td className="py-4">
                            {b.returnedAt
                              ? new Date(b.returnedAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-4">
                            <span className="font-semibold text-red-300">
                              {b.fine > 0 ? `₹${b.fine}` : "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {historyTotalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage((p) => p - 1)}
                      className="text-[#12343B] font-semibold px-5 py-2 rounded-lg disabled:opacity-40"
                    >
                      Prev
                    </Button>
                    <span className="px-3 py-1 text-[#C7D3D7]">
                      Page {historyPage} of {historyTotalPages}
                    </span>
                    <Button
                      disabled={historyPage === historyTotalPages}
                      onClick={() => setHistoryPage((p) => p + 1)}
                      className="text-[#12343B] font-semibold px-5 py-2 rounded-lg disabled:opacity-40"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
