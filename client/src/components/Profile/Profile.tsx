import Header from "../Header/Header"
import { useNavigate } from "react-router-dom";
import { IUser } from "../../../../shared/types";
import { useEffect,useState } from "react";
export default function Profile(){
    const [user,setUser]=useState<IUser | null>(null);
    const navigate=useNavigate();
    useEffect(()=>{
        const stored=localStorage.getItem('user');
        if(!stored) navigate('/login')
        else setUser(JSON.parse(stored));
    },[navigate])
    function handleClick(){
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    }
    if(!user) return null;
    return(
        <>
        <div>
            <h3>{user.username}</h3>
            <p>{user.height}</p>
            <p>{user.weight}</p>
        </div>
        <button onClick={handleClick}>Log out</button>
        </>
    )
}