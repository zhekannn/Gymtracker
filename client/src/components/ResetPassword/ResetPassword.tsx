import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });

      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  }
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
        <div className="max-w-md w-full bg-[#1E293B] p-8 rounded-2xl shadow-2xl text-center space-y-4">
          <h3 className="text-xl font-bold text-red-400">Invalid Link</h3>
          <p className="text-gray-400 text-sm">
            Reset token is missing or invalid. Please request a new password reset link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <h3 className="text-xl font-bold mb-8 text-white">Set new password</h3>

      <form 
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-[#1E293B] p-8 rounded-2xl shadow-2xl shadow-black/50 space-y-5"
      >
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400">
          🔒 New Password
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            placeholder="••••••••"
            className="bg-[#0F172A] border border-[#334155] text-white rounded-lg p-2.5 focus:border-[#22C55E] outline-none" 
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400">
          🔒 Confirm Password
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
            placeholder="••••••••"
            className="bg-[#0F172A] border border-[#334155] text-white rounded-lg p-2.5 focus:border-[#22C55E] outline-none" 
          />
        </label>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#22C55E] hover:bg-[#4ADE80] text-[#020617] font-bold py-2 rounded-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}