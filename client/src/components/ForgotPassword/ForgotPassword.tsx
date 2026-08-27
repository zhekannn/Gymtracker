import { useState } from "react";
import { toast } from "sonner";
import { API_URL } from '../../api/config';
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email }) 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      toast.success(data.message);
      setEmail("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <h3 className="text-xl font-bold mb-8 text-white">Forgot password</h3>
      <form 
        onSubmit={handleSubmit} 
        className="max-w-md w-full bg-[#1E293B] p-8 rounded-2xl shadow-2xl shadow-black/50 space-y-5"
      >
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400">
          📧 Email
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            placeholder="your@email.com"
            className="bg-[#0F172A] border border-[#334155] text-white rounded-lg p-2.5 focus:border-[#22C55E] outline-none" 
          />
        </label>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#22C55E] hover:bg-[#4ADE80] text-[#020617] font-bold py-2 rounded-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send email"}
        </button>
      </form>
    </div>
  );
}