import { Routes, Route } from "react-router-dom";
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
          if (!token) {
            if (location.pathname !== '/login' && location.pathname!=='/sign') navigate('/login');
            return;
          }
      
          try {
            const response = await fetch('/api/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
              throw new Error('Token invalid');
            }
            if(response.ok) navigate('/profile');
          } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }
        };
      
        verifyAuth();
      }, []);
    return(
        <Routes>
            <Route path="/login" element={<Login/>} ></Route>
            <Route path="/sign" element={<Registration/>} ></Route>
            <Route path="/profile" element={<Profile/>} ></Route>
        </Routes>
    )
}