import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword, logout } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, clearUser } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!user.isFirstLogin) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await resetPassword({ newPassword });
      toast.success("Password updated successfully.");
      await logout();
      clearUser();
    } catch (error) {
      setNewPassword("");

      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#12343B] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#35606B] bg-[#2D545E] p-8 shadow-xl flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-[#E1B382]">
          Set New Password
        </h1>

        <p className="text-center text-[#B7C3C7]">
          Welcome, <span className="font-semibold">{user?.memberId}</span>
        </p>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="New Password"
            name="password"
            value={newPassword}
            type="password"
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />

          <Button
            disabled={isSubmitting}
            loadingText="Submitting..."
            className="w-full rounded-lg bg-[#C89666] py-3 font-semibold text-white hover:bg-[#B78355]"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
