import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { login } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { refreshUser } = useContext(AuthContext);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await login({ memberId, password });

      await refreshUser();

      if (response.data.redirectToReset) {
        navigate("/reset-password");
        return;
      }

      navigate("/");
    } catch (error) {
      setPassword("");

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
        <h1 className="text-center text-3xl font-bold text-[#E1B382]">Login</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-stretch gap-5"
        >
          <Input
            label="Member ID"
            name="memberId"
            value={memberId}
            type="text"
            onChange={(e) => setMemberId(e.target.value)}
            autoComplete="username"
            disabled={isSubmitting}
            required
          />
          <Input
            label="Password"
            name="password"
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isSubmitting}
            required
          />

          <Button
            disabled={isSubmitting}
            loadingText="Logging In..."
            className="w-full bg-[#C89666] hover:bg-[#B78355] text-white rounded-lg py-3 font-semibold"
          >
            Login
          </Button>

          <p className="text-center text-sm text-[#9DB1B7]">
            Welcome back to ShelfSide.
          </p>
        </form>
      </div>
    </div>
  );
}
