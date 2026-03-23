import logo from '../../assets/images/logo.jpg'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect,useState } from 'react';
import avatar from '../../assets/images/avatar.jpg'
import { Avatar, AvatarFallback, AvatarImage,AvatarBadge } from "@/components/ui/avatar"
import { Button } from '../ui/button';
import { Menu } from "lucide-react"; 
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from "@/components/ui/sheet";
export default function Header() {
    const [isAuth, setIsAuth] = useState(false);
    const location=useLocation();
    const navigate=useNavigate();
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
  function handleClick(){
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login', {replace:true});
}
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
        <Button className='hover:cursor-pointer hover:bg-[#4ADE80] bg-green-700' onClick={handleClick}>Log out</Button>
        <Avatar className="w-[2.5em] h-[2.5em]">
  <AvatarImage src={avatar} />
  <AvatarFallback></AvatarFallback>
  <AvatarBadge className="bg-green-600 dark:bg-green-800" />
</Avatar>
        <Link to="/profile" className="text-sm font-medium text-gray-400 hover:text-[#22C55E] transition-colors">Profile</Link>
        <Link to="/workouts" className="text-sm font-medium text-gray-400 hover:text-[#22C55E] transition-colors">Workouts</Link>
      </nav>}
      {isAuth &&
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-[#020617] border-slate-800 text-white">
          <SheetTitle className="text-white">Menu</SheetTitle>
          <nav className="flex flex-col gap-4 mt-8">
          <Link to="/profile" className="text-sm font-medium text-gray-400 hover:text-[#22C55E] transition-colors">Profile</Link>
          <Link to="/workouts" className="text-sm font-medium text-gray-400 hover:text-[#22C55E] transition-colors">Workouts</Link>
            <hr className="border-slate-800" />
            <Button onClick={handleClick} className="w-full bg-[#22C55E] text-black">Log out</Button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
}
  </header>
)
}