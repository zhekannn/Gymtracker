import logo from '../../assets/images/logo.jpg'
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect,useState } from 'react';
export default function Header() {
    const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuth(false);
        return;
      }
      try {
        const response = await fetch('/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuth(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuth(false);
        }
      } catch (err) {
        console.error("Auth verification failed", err);
        setIsAuth(false);
      }
    };

    verifyToken();
  }, [location]);
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#020617]/80 backdrop-blur-md border-b border-[#334155] sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#22C55E] shadow-lg shadow-[#22C55E]/20">
          <img 
            className="w-full h-full object-cover" 
            src={logo} 
            alt="Gym Tracker Logo" 
          />
        </div>
        
        <h2 className="text-xl font-black tracking-tighter uppercase italic text-white">
          Gym <span className="text-[#22C55E]">Tracker</span>
        </h2>
      </div>
      {isAuth &&
      <nav className="hidden md:flex items-center gap-6">
        <a href="/profile" className="text-sm font-medium text-gray-400 hover:text-[#22C55E] transition-colors">Profile</a>
        <a href="/workouts" className="text-sm font-medium text-gray-400 hover:text-[#22C55E] transition-colors">Workouts</a>
      </nav>}
    </header>
  )
}