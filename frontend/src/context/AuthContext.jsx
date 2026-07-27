import { createContext, useCallback, useEffect, useState } from "react";

import { getCurrentUser } from "../api/auth";

export const AuthContext = createContext({
  user: null,
  loading: true,
  refreshUser: () => {},
  clearUser: () => {},
});

export function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getCurrentUser();
      setCurrentUser(response.data.user);
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const clearUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const authContext = {
    user: currentUser,
    loading,
    refreshUser: fetchUser,
    clearUser,
  };

  return <AuthContext value={authContext}>{children}</AuthContext>;
}
