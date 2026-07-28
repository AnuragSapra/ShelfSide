import { useEffect, useState } from "react";
import { getAllMembersBorrows } from "../api/borrows";
import { getMemberById } from "../api/members";
import toast from "react-hot-toast";
import { Eye } from "lucide-react";
import Button from "./Button";
import ViewMemberModal from "../components/ViewMemberModal";
import BorrowHistoryModal from "../components/BorrowHistoryModal";
import { handleDeactivateMember, handleReactivateMember } from "../api/members";

const STATUS_COLORS = {
  pending: "bg-yellow-500",
  cancelled: "bg-gray-400",
  approved: "bg-blue-500",
  ready: "bg-cyan-500",
  collected: "bg-green-500",
  returned: "bg-gray-500",
  rejected: "bg-red-500",
};

export default function PastRequestsTable() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showBorrowHistory, setShowBorrowHistory] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPastRequests();
  }, [page]);

  async function fetchPastRequests() {
    setLoading(true);
    try {
      const res = await getAllMembersBorrows({
        status: "returned,rejected,cancelled",
        page,
        limit: 10,
      });
      setBorrows(res.data.borrows);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Failed to load past requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleViewMember(memberId) {
    try {
      const response = await getMemberById(memberId);
      setSelectedMember(response.data.member);
    } catch (error) {
      toast.error("Failed to load member details.");
    }
  }

  async function handleDeactivate(id) {
    const confirmed = window.confirm("Deactivate this member?");
    if (!confirmed) return;
    try {
      setActionLoading(true);
      await handleDeactivateMember(id);
      toast.success("Member deactivated.");
      setSelectedMember(null);
      await fetchPastRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to deactivate.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReactivate(memberId) {
    const confirmed = window.confirm("Reactivate this member?");
    if (!confirmed) return;
    try {
      setActionLoading(true);
      await handleReactivateMember(memberId);
      toast.success("Member reactivated.");
      setSelectedMember(null);
      await fetchPastRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reactivate.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <section>
      <div className="bg-[#2D545E] rounded-2xl border border-[#35606B] p-6">
        <h2 className="text-2xl font-semibold text-[#E1B382] mb-6">
          Past Requests
        </h2>

        {loading ? (
          <div className="py-10 text-center text-[#B7C3C7]">Loading...</div>
        ) : borrows.length === 0 ? (
          <div className="py-10 text-center text-[#B7C3C7]">
            No past requests.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#4B7079] text-[#E1B382]">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">
                      Member
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Member ID
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">Book</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left font-semibold w-1">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {borrows.map((b) => {
                    const statusColor = STATUS_COLORS[b.status];

                    return (
                      <tr
                        key={b._id}
                        className="border-b border-[#3C626B] hover:bg-[#365E68] transition"
                      >
                        <td className="py-4 px-4">{b.user.name}</td>

                        <td className="py-4 px-4 text-[#C7D3D7]">
                          {b.user.memberId}
                        </td>

                        <td
                          className="py-4 px-4 max-w-64 truncate"
                          title={b.book.title}
                        >
                          {b.book.title}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block h-2 w-2 rounded-full mr-2 ${statusColor}`}
                          />
                          <span className="capitalize">{b.status}</span>
                        </td>

                        <td className="py-4 px-4 w-1">
                          <Button
                            onClick={() => handleViewMember(b.user.memberId)}
                            className="border border-[#C89666] text-[#E1B382] hover:bg-[#C89666]/20 rounded-lg px-4 py-2 whitespace-nowrap"
                          >
                            <Eye size={18} />
                            <span>View</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-5 mt-8">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border border-[#C89666] bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold rounded-lg px-5 py-2"
                >
                  Prev
                </Button>

                <span className="rounded-lg bg-[#12343B] px-5 py-2 text-[#F8F8F6]">
                  Page {page} of {totalPages}
                </span>

                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border border-[#C89666] bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold rounded-lg px-5 py-2"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {selectedMember && (
          <>
            <ViewMemberModal
              selectedMember={selectedMember}
              actionLoading={actionLoading}
              onClose={() => {
                setSelectedMember(null);
                setShowBorrowHistory(false);
              }}
              onDeactivate={() => handleDeactivate(selectedMember.memberId)}
              onReactivate={() => handleReactivate(selectedMember.memberId)}
              onBorrowHistory={() => setShowBorrowHistory(true)}
            />

            <BorrowHistoryModal
              open={showBorrowHistory}
              member={selectedMember}
              onBack={() => setShowBorrowHistory(false)}
            />
          </>
        )}
      </div>
    </section>
  );
}
