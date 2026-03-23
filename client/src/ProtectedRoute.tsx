import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner"
import { useEffect, useState } from "react";
export const ProtectedRoute = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const token = localStorage.getItem('token');
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }
      try {
        const res = await fetch('/api/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setIsValid(true);
        else throw new Error();
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsVerifying(false);
      }
    };
    verify();
  }, [token]);

  if (isVerifying) return <div className="flex items-center justify-center gap-6 h-[75vh]"><Spinner className="size-10"/></div>;

  return isValid ? <Outlet /> : <Navigate to="/login" replace />;
};
export const PublicRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/profile" replace /> : <Outlet />;
};