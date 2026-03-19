import { BrowserRouter } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"  
import React from "react"
import Router from "./Router"
import ReactDOM from "react-dom/client"
import './index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
    <Router />
    <Toaster richColors position="top-center" theme="dark" />
    </BrowserRouter>
  </React.StrictMode>,
)
