// src/hooks/useAuth.js
import { useSelector } from "react-redux";

export function useAuth() {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin: user?.role === "ADMIN",
    isManager: user?.role === "RESTAURANT_MANAGER",
    isCustomer: user?.role === "CUSTOMER",
  };
}
