import { Routes, Route } from "react-router-dom";
import Registration from "./components/Registration/Registration";
import App from "./components/App/App";
export default function Router(){
    return(
        <Routes>
            <Route path="/" element={<App/>} ></Route>
            <Route path="/sign" element={<Registration/>} ></Route>
        </Routes>
    )
}