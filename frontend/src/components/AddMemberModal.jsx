import Button from "./Button";
import Input from "./Input";

export default function AddMemberModal({
  onSubmit,
  onCancel,
  disabled,
  addForm,
  setAddForm,
  open,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#35606B] bg-[#2D545E] shadow-xl">
        <div className="border-b border-[#35606B] px-8 py-5">
          <h2 className="text-2xl font-bold text-[#E1B382]">Add Member</h2>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5 p-8">
          <Input
            label="Name"
            name="name"
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={addForm.email}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={addForm.password}
            onChange={(e) =>
              setAddForm({ ...addForm, password: e.target.value })
            }
            required
          />

          <Input
            label="Mobile Number"
            name="phone"
            type="tel"
            value={addForm.phone}
            onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
            required
          />

          <Input
            label="Address"
            name="address"
            value={addForm.address}
            onChange={(e) =>
              setAddForm({ ...addForm, address: e.target.value })
            }
            required
          />

          <div className="mt-4 flex justify-end gap-3 border-t border-[#35606B] pt-6">
            <Button
              type="button"
              onClick={onCancel}
              disabled={disabled}
              className="border border-[#C89666] bg-transparent text-[#E1B382] hover:bg-[#C89666]/20 rounded-lg px-6 py-2"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={disabled}
              loadingText="Adding..."
              className="bg-[#C89666] hover:bg-[#B78355] text-[#12343B] font-semibold rounded-lg px-6 py-2"
            >
              Add Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
