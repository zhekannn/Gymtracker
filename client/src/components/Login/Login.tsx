import { useState } from 'react'
import Header from "../Header/Header.js"
import { IUser } from '../../../../shared/types'
import { useNavigate,Link } from 'react-router-dom';
export default function Login() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    remember: false
  })
  const navigate = useNavigate();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user as IUser));
        navigate('/profile', { 
          replace: true, 
          state: { loginSuccess: true, username: data.user.username } 
      });
      } else {
        alert(data.message || 'Authorization error');
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  }
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <h3 className="text-3xl font-bold mb-8 text-white">Login</h3>
        <form 
          onSubmit={handleSubmit} 
          className="w-full max-w-sm bg-[#1E293B] p-8 rounded-2xl shadow-2xl shadow-black/50 space-y-5">
          <label className="flex flex-col gap-2 text-sm font-medium">
            👤 Username
            <input 
              type="text" 
              required 
              className="bg-[#0F172A] border border-[#334155] text-[#F8FAFC] rounded-lg p-3 focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
              value={form.username} 
              onChange={(e) => setForm({ ...form, username: e.target.value })} 
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            🔒 Password
            <input 
              type="password" 
              required 
              className="bg-[#0F172A] border border-[#334155] text-[#F8FAFC] rounded-lg p-3 focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
          </label>

          <div className="flex items-center gap-2 text-sm py-1">
            <input 
              type="checkbox" 
              className="w-4 h-4 accent-[#22C55E]"
              checked={form.remember} 
              onChange={(e) => setForm({ ...form, remember: e.target.checked })} 
            />
            <span>Remember me</span>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#22C55E] hover:bg-[#4ADE80] text-[#020617] font-bold py-3 rounded-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            Log in
          </button>
          <div className="text-center space-y-2 text-sm">
            <p className="justify-center"><Link to="#" className="text-[#22C55E] hover:text-[#4ADE80]" >Forgot password?</Link></p>
            <p className="justify-center">
              New here? <strong className="ml-1"><Link to="/sign" className="text-[#22C55E] hover:text-[#4ADE80]" >Sign up</Link></strong>
            </p>
          </div>
        </form>
      </div>
    </>
  )
}