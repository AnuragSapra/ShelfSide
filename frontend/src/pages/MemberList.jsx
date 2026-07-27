import { useEffect, useState } from "react";
import {
  getAllMembers,
  handleCreateMember,
  handleDeactivateMember,
  handleReactivateMember,
} from "../api/members.js";
import toast from "react-hot-toast";
import Button from "../components/Button";
import Input from "../components/Input";
import AddMemberModal from "../components/AddMemberModal";
import ViewMemberModal from "../components/ViewMemberModal";
import MemberTable from "../components/MemberTable";
import BorrowHistoryModal from "../components/BorrowHistoryModal.jsx";

export default function MemberList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showBorrowHistory, setShowBorrowHistory] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const response = await getAllMembers({ showInactive: true });
      setMembers(response.data.members);
    } catch (error) {
      toast.error("Failed to load members.");
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.memberId.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleAddSubmit(e) {
    e.preventDefault();

    console.log("Submitting form");
    try {
      setAddSubmitting(true);
      const response = await handleCreateMember(addForm);
      toast.success(response.data.message || "Member created.");
      setShowAddModal(false);
      setAddForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
      });
      await fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member.");
    } finally {
      setAddSubmitting(false);
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
      await fetchMembers();
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
      await fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reactivate.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#12343B] text-[#F8F8F6]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-[#E1B382] mb-8">Members</h1>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <Input
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or Member ID..."
            className="w-full md:w-80"
          />

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold py-3 px-6 whitespace-nowrap"
          >
            + Add Member
          </Button>
        </div>

        <MemberTable members={filteredMembers} onView={setSelectedMember} />

        <AddMemberModal
          open={showAddModal}
          onSubmit={handleAddSubmit}
          onCancel={() => setShowAddModal(false)}
          disabled={addSubmitting}
          addForm={addForm}
          setAddForm={setAddForm}
        />

        <ViewMemberModal
          selectedMember={showBorrowHistory ? null : selectedMember}
          actionLoading={actionLoading}
          onClose={() => setSelectedMember(null)}
          onDeactivate={() => handleDeactivate(selectedMember.memberId)}
          onReactivate={() => handleReactivate(selectedMember.memberId)}
          onBorrowHistory={() => {
            setShowBorrowHistory(true);
          }}
        />

        <BorrowHistoryModal
          open={showBorrowHistory}
          member={selectedMember}
          onBack={() => setShowBorrowHistory(false)}
        />
      </div>
    </div>
  );
}
