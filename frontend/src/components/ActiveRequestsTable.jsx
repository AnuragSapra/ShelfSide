import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllMembersBorrows,
  approveRequest,
  rejectRequest,
  markReady,
  markCollected,
  markReturned,
} from "../api/borrows";
import { Check, X, PackageCheck, HandHelping, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import Button from "./Button";
import Select from "./Select";

const STATUS_COLORS = {
  pending: "bg-yellow-500",
  cancelled: "bg-gray-400",
  approved: "bg-blue-500",
  ready: "bg-cyan-500",
  collected: "bg-green-500",
  returned: "bg-gray-500",
  rejected: "bg-red-500",
};

export default function ActiveRequestsTable() {
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    fetchActiveBorrows();
  }, [statusFilter]);

  async function fetchActiveBorrows() {
    setLoadingActive(true);
    try {
      const res = await getAllMembersBorrows({
        status: statusFilter || "pending,approved,ready,collected",
      });
      setActiveBorrows(res.data.borrows);
    } catch (error) {
      toast.error("Failed to load active requests.");
    } finally {
      setLoadingActive(false);
    }
  }

  async function handleApprove(borrowId) {
    setActingId(borrowId);
    try {
      await approveRequest(borrowId);
      toast.success("Request approved.");
      await fetchActiveBorrows();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve.");
    } finally {
      setActingId(null);
    }
  }

  function startReject(borrowId) {
    setRejectingId(borrowId);
    setRejectionReason("");
  }

  async function confirmReject(borrowId) {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    setActingId(borrowId);
    try {
      await rejectRequest(borrowId, { rejectionReason });
      toast.success("Request rejected.");
      setRejectingId(null);
      setRejectionReason("");
      await fetchActiveBorrows();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject.");
    } finally {
      setActingId(null);
    }
  }

  async function handleMarkReady(borrowId) {
    setActingId(borrowId);

    try {
      await markReady(borrowId);
      toast.success("Marked ready for pickup.");
      await fetchActiveBorrows();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setActingId(null);
    }
  }

  async function handleMarkCollected(borrowId) {
    setActingId(borrowId);

    try {
      await markCollected(borrowId);
      toast.success("Marked as collected.");
      await fetchActiveBorrows();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setActingId(null);
    }
  }

  async function handleMarkReturned(borrowId) {
    setActingId(borrowId);

    try {
      await markReturned(borrowId);
      toast.success("Marked as returned.");
      await fetchActiveBorrows();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="mb-10">
      <div className="bg-[#2D545E] rounded-2xl border border-[#35606B] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#E1B382]">
            Active Requests
          </h2>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#4B7079] bg-[#12343B] text-[#F8F8F6] py-3 focus:border-[#C89666]
                focus:outline-none"
            containerClassName="w-56"
          >
            <option value="">Active Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="ready">Ready</option>
            <option value="collected">Collected</option>
          </Select>
        </div>

        {loadingActive ? (
          <div className="py-10 text-center text-[#B7C3C7]">Loading...</div>
        ) : activeBorrows.length === 0 ? (
          <div className="py-10 text-center text-[#B7C3C7]">
            No active requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#4B7079] text-[#E1B382]">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Cover</th>
                  <th className="py-3 px-4 text-left font-semibold">Book</th>
                  <th className="py-3 px-4 text-left font-semibold">Member</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Member ID
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold w-48">
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
                      className="border-b border-[#3C626B] hover:bg-[#365E68] transition duration-200"
                    >
                      <td className="py-4 px-4">
                        <img
                          src={b.book.coverImage}
                          alt={b.book.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                      </td>
                      <td
                        className="py-4 px-4 max-w-64 truncate"
                        title={b.book.title}
                      >
                        <Link
                          to={`/books/${b.book.isbn}`}
                          className="hover:text-[#E1B382] transition"
                        >
                          {b.book.title}
                        </Link>
                      </td>
                      <td className="py-4 px-4">{b.user.name}</td>
                      <td className="py-4 px-4">{b.user.memberId}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block h-2 w-2 rounded-full mr-2 ${statusColor}`}
                        />
                        <span className="capitalize">{b.status}</span>
                      </td>
                      <td className="py-4 px-4 w-48">
                        {b.status === "pending" && (
                          <div className="flex items-center gap-2 w-fit">
                            {rejectingId === b._id ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  value={rejectionReason}
                                  onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                  }
                                  placeholder="Rejection reason..."
                                  className="w-full rounded-lg border border-[#4B7079] bg-[#12343B] text-[#F8F8F6]
                                      px-3 py-2 focus:border-[#C89666] focus:outline-none"
                                />
                                <div className="flex gap-1">
                                  <Button
                                    disabled={actingId === b._id}
                                    onClick={() => confirmReject(b._id)}
                                    className="border border-[#C89666] text-[#E1B382] bg-transparent hover:bg-green-500/50
                                      rounded-lg px-4 py-2"
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setRejectingId(null);
                                      setRejectionReason("");
                                    }}
                                    disabled={actingId === b._id}
                                    className="border border-[#C89666] text-[#E1B382] hover:bg-red-500/50 rounded-lg px-4 py-2"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="inline-flex gap-2">
                                <Button
                                  disabled={actingId === b._id}
                                  onClick={() => handleApprove(b._id)}
                                  className="border border-green-400 text-green-300 bg-transparent hover:bg-green-500/50
                                  hover:border-green-500 hover:text-green-200 rounded-lg transition px-6 py-2"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </Button>
                                <Button
                                  disabled={actingId === b._id}
                                  onClick={() => startReject(b._id)}
                                  className="border border-red-400 text-red-300 bg-transparent hover:bg-red-500/50
                                  hover:border-red-500 hover:text-red-200 rounded-lg transition px-6 py-2"
                                  title="Reject"
                                >
                                  <X size={18} />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="w-fit">
                          {b.status === "approved" && (
                            <Button
                              onClick={() => handleMarkReady(b._id)}
                              disabled={actingId === b._id}
                              className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold rounded-lg px-5 py-3 whitespace-nowrap w-44"
                            >
                              <PackageCheck size={18} />
                              <span>Mark Ready</span>
                            </Button>
                          )}

                          {b.status === "ready" && (
                            <Button
                              onClick={() => handleMarkCollected(b._id)}
                              disabled={actingId === b._id}
                              className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold rounded-lg px-5 py-3 whitespace-nowrap w-44"
                            >
                              <HandHelping size={18} />
                              <span>Mark Collected</span>
                            </Button>
                          )}

                          {b.status === "collected" && (
                            <Button
                              onClick={() => handleMarkReturned(b._id)}
                              disabled={actingId === b._id}
                              className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold rounded-lg px-5 py-3 whitespace-nowrap w-44"
                            >
                              <RotateCcw size={18} />
                              <span>Mark Returned</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
