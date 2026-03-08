import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState('Загрузка...')
  useEffect(()=>{
    fetch('/api/message').then(res=>res.json()).then(json=> setData(json.message)).catch(err => setData('Ошибка связи с сервером'))
  },[])
  return (
    <>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Мой Fullstack Проект</h1>
      <p>Ответ от сервера: <strong>{data}</strong></p>
    </div>
    </>
  )
}

export default App
