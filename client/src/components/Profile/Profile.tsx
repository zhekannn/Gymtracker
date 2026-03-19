import Header from "../Header/Header"
import { toast } from "sonner"
import { useNavigate,useLocation } from "react-router-dom";
import { IUser } from "../../../../shared/types";
import { useEffect,useState,useRef } from "react";
export default function Profile(){
    const [user,setUser]=useState<IUser | null>(null);
    const navigate=useNavigate();
    const location=useLocation();
    const hasShown=useRef(false);
    useEffect(()=>{
        const stored=localStorage.getItem('user');
        if(!stored) navigate('/login', {replace:true})
        else setUser(JSON.parse(stored));
        if(location.state?.loginSuccess && !hasShown.current){
            toast.success('С возвращением!', {
                description: `Рады тебя видеть, ${location.state.username || 'атлет'}!`,
                duration: 2500,
              });
              hasShown.current=true;
        }

        navigate(location.pathname, { replace: true, state: {} });
    },[])
    function handleClick(){
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login', {replace:true});
    }
    if(!user) return null;
    return(
        <>
        <Header></Header>
        <div>
            <h3>{"Hello, "+user.username}</h3>
            <p>{user.height}</p>
            <p>{user.weight}</p>
        </div>
        <button onClick={handleClick}>Log out</button>
        </>
    )
}