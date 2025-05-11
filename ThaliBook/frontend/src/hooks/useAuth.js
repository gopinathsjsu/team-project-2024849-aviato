// src/hooks/useAuth.js
import { useSelector } from "react-redux";
import { getUserFromToken } from "@/utils/jwtUtils";

export function useAuth() {
  const { user, isAuthenticated, loading, token } = useSelector(
    (state) => state.auth
  );

  // If user is not in state but token exists, try to get user from token
  const currentUser = user || (token ? getUserFromToken(token) : null);

  return {
    user: currentUser,
    isAuthenticated,
    loading,
    isAdmin: currentUser?.role === "ADMIN",
    isManager: currentUser?.role === "RESTAURANT_MANAGER",
    isCustomer: currentUser?.role === "CUSTOMER",
  };
}
