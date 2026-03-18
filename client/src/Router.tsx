import { Routes, Route, replace } from "react-router-dom";
import Registration from "./components/Registration/Registration";
import Login from "./components/Login/Login";
import { useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import Profile from "./components/Profile/Profile";
export default function Router(){
    const navigate=useNavigate();
    const location=useLocation();
    useEffect(() => {
        const verifyAuth = async () => {
          const token = localStorage.getItem('token');
          const isAuthPage = location.pathname === '/login' || location.pathname === '/sign';
      if (!token) {
      if (!isAuthPage) navigate('/login', { replace: true });
      return;
    }
      
          try {
            const response = await fetch('/api/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
              throw new Error('Token invalid');
            }
            if(response.ok) {
              if (isAuthPage) {
                navigate('/profile', { replace: true });
              }
            }
          } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login', {replace:true});
          }
        };
      
        verifyAuth();
      }, [location.pathname]);
    return(
        <Routes>
            <Route path="/login" element={<Login/>} ></Route>
            <Route path="/sign" element={<Registration/>} ></Route>
            <Route path="/profile" element={<Profile/>} ></Route>
        </Routes>
    )
}