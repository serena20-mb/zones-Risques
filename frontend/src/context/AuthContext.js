import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("safezone_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem("safezone_guest") === "true");

  const login = (userData) => {
    setUser(userData);
    setIsGuest(false);
    localStorage.setItem("safezone_user", JSON.stringify(userData));
    localStorage.removeItem("safezone_guest");
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    localStorage.setItem("safezone_guest", "true");
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("safezone_user");
    localStorage.removeItem("safezone_guest");
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, login, continueAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);