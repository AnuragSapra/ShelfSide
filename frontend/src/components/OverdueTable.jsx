import { useEffect, useState } from "react";
import { getAllMembersBorrows } from "../api/borrows";
import toast from "react-hot-toast";
import { Eye } from "lucide-react";
import Button from "./Button";
import ViewMemberModal from "../components/ViewMemberModal";
import BorrowHistoryModal from "../components/BorrowHistoryModal.jsx";
import {
  handleDeactivateMember,
  handleReactivateMember,
} from "../api/members.js";

export default function OverdueTable() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showBorrowHistory, setShowBorrowHistory] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOverdue();
  }, []);

  async function fetchOverdue() {
    setLoading(true);
    try {
      const res = await getAllMembersBorrows({ status: "collected" });
      const overdue = res.data.borrows.filter((b) => b.fine > 0);
      setBorrows(overdue);
    } catch (error) {
      toast.error("Failed to load overdue books.");
    } finally {
      setLoading(false);
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
      await fetchOverdue();
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
      await fetchOverdue();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reactivate.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <section className="mb-10">
      <div className="bg-[#2D545E] rounded-2xl border border-[#35606B] p-6">
        <h2 className="text-2xl font-semibold text-[#E1B382] mb-6">
          Overdue Books
        </h2>

        {loading ? (
          <div className="py-10 text-center text-[#B7C3C7]">Loading...</div>
        ) : borrows.length === 0 ? (
          <div className="py-10 text-center text-[#B7C3C7]">
            No overdue books.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#4B7079] text-[#E1B382]">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Member</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Member ID
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Book</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Due Date
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Fine</th>
                  <th className="py-3 px-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {borrows.map((b) => (
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

                    <td className="py-4 px-4 text-[#C7D3D7]">
                      {b.dueDate
                        ? new Date(b.dueDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="py-4 px-4">
                      <span className="rounded-full bg-red-500/15 px-3 py-1 text-sm font-semibold text-red-300">
                        ₹{b.fine}
                      </span>
                    </td>

                    <td className="py-4 px-4 w-1">
                      <Button
                        onClick={() => setSelectedMember(b.user)}
                        className="border border-[#C89666] text-[#E1B382] hover:bg-[#C89666]/50 rounded-lg px-4 py-2 whitespace-nowrap"
                      >
                        <Eye size={18} />
                        <span>View</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedMember && (
          <>
            <ViewMemberModal
              selectedMember={selectedMember}
              actionLoading={actionLoading}
              onClose={() => setSelectedMember(null)}
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
