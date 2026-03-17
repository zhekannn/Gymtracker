import Header from "../Header/Header"
import classes from "../App/App.module.css"
import { useEffect,useState } from "react"
import {IUser} from '../../../../shared/types'
export default function Registration(){
    const [message, setMessage]=useState('');
    const [formData,setFormData]=useState({
        username:'',
        email:'',
        password:'',
        weight:0,
        height:0
    })
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault(); 
        try{
            const response=await fetch("/api/users",{
                method:'POST',
                headers:{
                    'Content-type':'application/json',
                },
                body:JSON.stringify(formData),
            }
            )
            if( response.ok){
                const data=await response.json();
                const user: IUser=data.user;
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(user as IUser));
                setMessage(`Success! User ${user.username} has been created with ID: ${user.id}`)
            }
            else {
                const errorData = await response.json();
                setMessage(errorData);
        }
    }
        catch(err){
            console.error('Request error:', err);
            setMessage(`Request error:${err}`);
        }
    }
    return(
        <>
         <Header></Header>
    <div className={`${classes.login}`}>
    <h3>Registration</h3>
        <form onSubmit={handleSubmit} className={`${classes.form}`}>
        
          <label htmlFor="username">👤Username
          <input type="text" name='username' required value={formData.username} onChange={(e)=>setFormData({...formData, username:e.target.value})}/></label>
          <label htmlFor="email">Email
          <input type="text" name='email' required value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})}/></label>
          <label htmlFor="pass">🔒Password
          <input type="password" name="pass" required value={formData.password} onChange={(e)=>setFormData({...formData, password:e.target.value})}/></label>
          <label htmlFor="weight">Weight
          <input type="text" name="weight" required value={formData.weight} onChange={(e)=>setFormData({...formData, weight:Number(e.target.value)})}/></label>
          <label htmlFor="height">Height
          <input type="text" name="height" required value={formData.height} onChange={(e)=>setFormData({...formData, height:Number(e.target.value)})}/></label>
          <p>Remember me<input type="radio" /></p>
          <button className={classes.loginbtn} type='submit'>Sign in</button>
          <p>Already have an account?<strong><a href="/">Log in</a></strong></p>
        </form>
        <p>{message && message}</p>
    </div>
        </>
    )
}