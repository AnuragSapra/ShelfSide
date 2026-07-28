import Button from "./Button";
import { ArrowRight } from "lucide-react";

export default function ViewMemberModal({
  selectedMember,
  actionLoading,
  onClose,
  onDeactivate,
  onReactivate,
  onBorrowHistory,
}) {
  if (!selectedMember) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl border border-[#35606B] bg-[#2D545E] shadow-xl">
        <div className="border-b border-[#35606B] px-6 py-5">
          <h2 className="text-2xl font-semibold text-[#E1B382]">
            {selectedMember.name}
          </h2>
          <p className="mt-1 text-sm text-[#B7C3C7]">
            Member ID: {selectedMember.memberId}
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-[#C89666]">Email</p>
              <p>{selectedMember.email}</p>
            </div>

            <div>
              <p className="text-sm text-[#C89666]">Phone</p>
              <p>{selectedMember.phone}</p>
            </div>

            <div>
              <p className="text-sm text-[#C89666]">Joined</p>
              <p>{new Date(selectedMember.createdAt).toLocaleDateString()}</p>
            </div>

            <div>
              <p className="text-sm text-[#C89666]">Status</p>

              {selectedMember.isActive ? (
                <span className="inline-flex rounded-full bg-green-500/15 px-2 py-1 text-sm font-medium text-green-400">
                  Active
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-red-500/15 px-2 py-1 text-sm font-medium text-red-400">
                  Inactive
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#C89666]">
              Currently Borrowed Books
            </p>

            {(selectedMember.currentBorrowedBooks ?? []).length > 0 ? (
              <ul className="space-y-2">
                {selectedMember.currentBorrowedBooks.map((b) => (
                  <li
                    key={b._id}
                    className="rounded-lg border border-[#35606B] bg-[#12343B] px-3 py-2"
                  >
                    {b.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#B7C3C7]">No books currently borrowed.</p>
            )}
          </div>

          <button
            onClick={onBorrowHistory}
            className="inline-flex items-center gap-2 font-medium text-[#E1B382] transition hover:text-[#C89666]"
          >
            View Borrow History
            <ArrowRight size={16} />
          </button>

          <div className="flex justify-end gap-3 border-t border-[#35606B] pt-5">
            <Button
              onClick={onClose}
              className="border border-[#C89666] text-[#E1B382] hover:bg-[#C89666]/20 px-5 py-2 rounded-lg"
            >
              Close
            </Button>

            {selectedMember.isActive ? (
              <Button
                disabled={actionLoading}
                onClick={onDeactivate}
                className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-lg"
              >
                Deactivate
              </Button>
            ) : (
              <Button
                disabled={actionLoading}
                onClick={onReactivate}
                className="bg-[#2E8B57] hover:bg-[#267349] text-white px-5 py-2 rounded-lg"
              >
                Reactivate
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
