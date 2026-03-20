import { toast } from "sonner"
import { useNavigate,useLocation } from "react-router-dom";
import { IUser } from "../../../../shared/types";
import { useEffect,useState,useRef } from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
  import avatar from '../../assets/images/avatar.jpg'
  import { Avatar, AvatarFallback, AvatarImage,AvatarBadge } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, BarChart3, Clock, Scale } from "lucide-react"
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
                description: `Рады тебя видеть, ${JSON.parse(stored!).username || "атлет"}!`,
                duration: 2500,
              });
              hasShown.current=true;
        }

        navigate(location.pathname, { replace: true, state: {} });
    },[])
    if(!user) return null;
    return(
        <>
           <h1 className="text-center text-[1.5em]">Profile</h1>
        <ResizablePanelGroup
      orientation="horizontal"
      className="rounded-lg border max-w-xxl  bg-[#1E293A] min-h-[12em] mt-[3em]"
    >
        
      <ResizablePanel defaultSize="33%">
        <div className=" w-full h-full flex justify-center text-center items-center">
        <div className="flex-col ">
        <img src={avatar} alt="" className="max-w-[8em] rounded border-border m-2" />
        <p className="text-[1.5em]">{ user.username}</p>
            <p className="p-[0.8em]">{"Your height: "+user.height}</p>
            <p>{"Your weight: "+user.weight}</p>
        </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="66%">
      <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel defaultSize="50%">
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="50%">
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Tree</span>   
            </div>
            </ResizablePanel>
            </ResizablePanelGroup>
      </ResizablePanel>
      </ResizablePanelGroup>
        </>
    )
}