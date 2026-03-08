import { useState, useEffect } from 'react'
import classes from './App.module.css'
import Header from "../Header/Header"
function App() {
  // const [data, setData] = useState('Загрузка...')
  // useEffect(()=>{
  //   fetch('/api/message').then(res=>res.json()).then(json=> setData(json.message)).catch(err => setData('Ошибка связи с сервером'))
  // },[])
  return (
    <>
      {/* <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Мой Fullstack Проект</h1>
      <p>Ответ от сервера: <strong>{data}</strong></p>
    </div> */}
    <Header></Header>
    <div className={`${classes.login}`}>
    <h3>Login</h3>
        <form action="" className={`${classes.form}`}>
        
          <label htmlFor="username">👤Username
          <input type="text" name='username' /></label>
          {/* <label htmlFor="age">Age
          <input type="text" name='age' /></label>
          <label htmlFor="weight">Bodyweight
          <input type="text" name="weight" /></label> */}
          <label htmlFor="pass">🔒Password
          <input type="password" name="pass" /></label>
          <p>Remember me<input type="radio" /></p>
          <button className={classes.loginbtn} type='submit'>Log in</button>
          <p><a href="#">Forgot password?</a></p>
          <p>New here?<strong><a href="#">Sign up</a></strong></p>
        </form>
    </div>
    </>
  )
}

export default App
