import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Registration from "./components/Registration/Registration";
import Login from "./components/Login/Login";
import Profile from "./components/Profile/Profile";
import Workouts from "./components/Workouts/Workouts";
import Plans from "./components/Plans/Plans";
import { ProtectedRoute, PublicRoute } from "./ProtectedRoute";
export default function Router() {
  return (
    <>
      <Header></Header>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/sign" element={<Registration />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/workouts" element={<Workouts/>}></Route>
        <Route path="/plans" element={<Plans/>}></Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}