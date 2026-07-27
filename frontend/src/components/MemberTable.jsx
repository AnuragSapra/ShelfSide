import Button from "./Button";

export default function MemberTable({ members, onView }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#35606B] bg-[#2D545E]">
      <table className="w-full">
        <thead className="border-b border-[#4B7079] text-[#E1B382]">
          <tr>
            <th className="py-3 px-4 text-left font-semibold">Name</th>
            <th className="py-3 px-4 text-left font-semibold">Member ID</th>
            <th className="py-3 px-4 text-left font-semibold">Borrowed</th>
            <th className="py-3 px-4 text-left font-semibold">Joined</th>
            <th className="py-3 px-4 text-left font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-10 text-center text-[#B7C3C7]">
                No members found.
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <tr
                key={member._id}
                className="border-b border-[#3C626B] transition hover:bg-[#365E68]"
              >
                <td className="px-4 py-4">
                  <span
                    className={`mr-3 inline-block h-2 w-2 rounded-full ${
                      member.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  {member.name}
                </td>

                <td className="px-4 py-4 text-[#C7D3D7]">{member.memberId}</td>

                <td className="px-4 py-4">
                  <span className="inline-flex rounded-full bg-[#12343B] px-3 py-1 text-sm">
                    {member.currentBorrowedBooks?.length ?? 0}
                  </span>
                </td>

                <td className="px-4 py-4 text-[#C7D3D7]">
                  {new Date(member.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-4 w-1">
                  <Button
                    onClick={() => onView(member)}
                    className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold rounded-lg px-4 py-2 whitespace-nowrap"
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
