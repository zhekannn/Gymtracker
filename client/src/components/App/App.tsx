import { useState, useEffect } from 'react'
import classes from './App.module.css'
import Header from "../Header/Header.js"
import {IUser} from '../../../../shared/types'
export default function App() {
  const [form, setForm]=useState({
    username:'',
    password:''
  })
    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      try{
          const response=await fetch('/api/login', {
            method:'POST',
            headers:{
              'Content-type':'application/json'
            },
            body:JSON.stringify(form),
          });
          const data=await response.json();
          if(response.ok){
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user as IUser));
            alert(`Welcome, ${data.user.username}!`);
            localStorage.setItem('user', JSON.stringify(data));
        } else {
            alert(data.message || 'Authorization error');
        }
    }
    catch (err) {
        console.error("Network error:", err);
        alert("Failed to connect to the server");
    }
  }
  return (
    <>
    <Header></Header>
    <div className={`${classes.login}`}>
    <h3>Login</h3>
        <form onSubmit={handleSubmit} className={`${classes.form}`}>
        
          <label htmlFor="username">👤Username
          <input type="text" name='username' required value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})}/></label>
          <label htmlFor="pass">🔒Password
          <input type="password" name="pass" required value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/></label>
          <p>Remember me<input type="radio" /></p>
          <button className={classes.loginbtn} type='submit'>Log in</button>
          <p><a href="#">Forgot password?</a></p>
          <p>New here?<strong><a href="/sign">Sign up</a></strong></p>
        </form>
    </div>
    </>
  )
}