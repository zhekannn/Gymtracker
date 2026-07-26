import { toast } from "sonner"
import { useNavigate,useLocation, data } from "react-router-dom";
import { IExercise, IUser } from "../../../../shared/types";
import { useEffect,useState,useRef } from "react";
import avatar from '../../assets/images/avatar.jpg';
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { User, Ruler, Scale, Dumbbell, Edit2,ChartNoAxesColumnIncreasing,History} from "lucide-react";
import { IWorkout } from "../../../../shared/types";
import WorkoutSection from "../WorkoutSection/WorkoutSection";
export default function Profile(){
    const [user,setUser]=useState<IUser | null>(null);
    const [trainings,setTrainings]=useState<IWorkout[] | null>(null);
    const navigate=useNavigate();
    const location=useLocation();
    const hasShown=useRef(false);
    async function getTrainings(id:number) {
      try{
      const response=await fetch(`/api/workouts?userId=${id}`);
      if(response.ok){
        const data=await response.json();
        setTrainings(data);
      }
      else{
        const data=await response.json();
        toast.error(data.message || "Error!");

      }
    }
    catch(err){
        toast.error("Server error");
    }
      }
    useEffect(()=>{
        const stored=localStorage.getItem('user');
        if(!stored){
          navigate('/login', {replace:true})
          return;
        } 
        const parsedUser=JSON.parse(stored);
        setUser(parsedUser);
        getTrainings(parsedUser.id);
        if(location.state?.loginSuccess && !hasShown.current){
            toast.success('Welcome back!', {
                description: `Рады тебя видеть, ${JSON.parse(stored!).username || "атлет"}!`,
                duration: 2500,
              });
              hasShown.current=true;
        }
        navigate(location.pathname, { replace: true, state: {} });
    },[])
    if(!user) return null;
    console.log(trainings);
    return (
      <div className="md:flex md:grid-cols-3 w-[100%] justify-center">
      <div className=" relative flex flex-col items-center bg-[#0F213B] mx-4 p-6 rounded-2xl border-2 border-primary/30 shadow-xl transition-all hover:border-primary/60 md:w-[33.3%]">
        <div className="flex items-center gap-2 mb-6">
          <User className="text-primary" size={20} />
          <h3 className="text-xl font-bold text-white">Personal info</h3>
        </div>
        <div className="relative mb-6">
          <img 
            src={avatar} 
            alt="Avatar" 
            className="w-32 h-32 rounded-full border-4 border-slate-800 object-cover shadow-lg"
          />
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-[#0F213B] rounded-full"></div>
        </div>
        <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
          {user.username}
        </h2>
        <div className="w-full space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <span className="flex items-center gap-2 text-slate-400 text-sm"><Ruler size={16}/> Height</span>
            <span className="font-semibold text-[#4ADE80]">{user.height} cm</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <span className="flex items-center gap-2 text-slate-400 text-sm"><Scale size={16}/> Weight</span>
            <span className="font-semibold text-[#4ADE80]">{user.weight} kg</span>
          </div>
    
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <span className="flex items-center gap-2 text-slate-400 text-sm"><Dumbbell size={16}/> Trainings</span>
            <span className="font-semibold text-white">{user.trainingCount}</span>
          </div>
        </div>
    
        {!trainings && (
          <p className="text-sm text-slate-400 mb-6 leading-relaxed text-center">
            Dont have any trainings? Create a plan{" "}
            <Link to="/plans" className="text-primary font-medium underline decoration-primary/30 hover:decoration-primary transition-all">
              here
            </Link>
            {" "}and start progressing!
          </p>
        )}
        <Button 
          variant="outline" 
          className="w-full border-primary/50 text-white hover:bg-primary hover:text-black hover:cursor-pointer transition-colors gap-2"
        >
          <Edit2 size={16} />
          Edit profile
        </Button>
      </div>


      <div className=" md:w-[33.3%] relative flex flex-col items-center bg-[#0F213B] mx-4 p-6 rounded-2xl border-2 border-primary/30 shadow-xl transition-all hover:border-primary/60">
        <div className="flex items-center gap-2 mb-6">
          <ChartNoAxesColumnIncreasing className="text-primary" size={20}/>
          <h3 className="text-xl font-bold text-white">Progress</h3>
        </div>
        <div className="mt-[2em]">
          {!trainings &&
          <p>Here you will see your progress!</p>
          }
        </div>
      </div>

      <div className=" md:w-[33.3%] relative flex flex-col items-center bg-[#0F213B] mx-4 p-6 rounded-2xl border-2 border-primary/30 shadow-xl transition-all hover:border-primary/60">
        {/* <div className="flex items-center gap-2 mb-6">
          <History className="text-primary" size={20} />
          <h3 className="text-xl font-bold text-white">Training history</h3>
        </div>
          <div className="flex text-center mt-[2em]">
            {!trainings &&
            <p>This list is empty. You dont have any trainings <Link to='/workouts'><Button className="w-[75%] bg-[#0F0011] text-secondary hover:cursor-pointer hover:bg-primary hover:text-black border border-primary h-[2.5em]">Create one</Button></Link></p>
            }
           {trainings && trainings.length > 0 && (
  <div className="w-full space-y-4">
    {trainings.map((training: IWorkout) => (
      <div key={training.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-left">
        <h4 className="font-bold text-primary mb-2">
          {training.planNameSnapshot || "Без названия"}
        </h4>
        <div className="pl-2 border-l-2 border-slate-700 space-y-1">
          {training.exercisesSnapshot.map((exercise: IExercise, index: number) => (
            <div key={`${exercise.name}-${index}`} className="flex justify-between text-sm">
              <span className="text-slate-300">{exercise.name}</span>
              <span className="text-slate-500 font-mono">{exercise.reps} reps</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)}
          </div> */}
        <WorkoutSection></WorkoutSection>
      </div>
      </div>
    );
}