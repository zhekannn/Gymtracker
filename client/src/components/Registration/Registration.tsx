import Header from "../Header/Header"
import { useState } from "react"
import { IUser } from '../../../../shared/types'
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"
export default function Registration() {
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    weight: '',
    height: '',
    rememberMe: false
  })
  const navigate = useNavigate();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch("/api/users", {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user as IUser));
        navigate('/profile', { replace:true,
          state: { loginSuccess: true, username: data.user.username } 
      });
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Registration error");
      }
    } catch (err) {
      setMessage(`Request error: ${err}`);
    }
  }
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-10 px-4">
        <h3 className="text-3xl font-bold mb-8 text-white">Registration</h3>
        <form 
          onSubmit={handleSubmit} 
          className="w-full max-w-md bg-[#1E293B] p-8 rounded-2xl shadow-2xl shadow-black/50 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400">
              👤 Username
              <input type="text" required className="bg-[#0F172A] border border-[#334155] text-white rounded-lg p-2.5 focus:border-[#22C55E] outline-none" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400">
              📧 Email
              <input type="email" required className="bg-[#0F172A] border border-[#334155] text-white rounded-lg p-2.5 focus:border-[#22C55E] outline-none" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400">
            🔒 Password
            <input type="password" required className="bg-[#0F172A] border border-[#334155] text-white rounded-lg p-2.5 focus:border-[#22C55E] outline-none" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400">
              ⚖️ Weight (kg)
              <input type="number" required className="bg-[#0F172A] border border-[#334155] text-white rounded-lg p-2.5 focus:border-[#22C55E] outline-none" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400">
              📏 Height (cm)
              <input type="number" required className="bg-[#0F172A] border border-[#334155] text-white rounded-lg p-2.5 focus:border-[#22C55E] outline-none" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value})} />
            </label>
          </div>

          <div className="flex items-center gap-2 text-sm pt-2">
            <input type="checkbox" className="w-4 h-4 accent-[#22C55E]" checked={formData.rememberMe} onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })} />
            <span>Remember me</span>
          </div>

          <button type="submit" className="w-full bg-[#22C55E] hover:bg-[#4ADE80] text-[#020617] font-bold py-3 rounded-lg transition-all mt-4 cursor-pointer">
            Sign up
          </button>

          <p className="text-center text-sm pt-2">
            Already have an account? <a href="/" className="text-[#22C55E] font-bold hover:underline ml-1">Log in</a>
          </p>
        </form>
        {message &&  <Alert variant= "destructive" className="max-w-md border-amber-200 bg-red-200 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <AlertCircleIcon />
      <AlertTitle className="text-red-600">
        {message}
      </AlertTitle>
    </Alert>}
      </div>
    </>
  )
}