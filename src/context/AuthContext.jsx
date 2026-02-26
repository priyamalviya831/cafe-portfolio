import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith("cafe_user_")
    );

    if (keys.length > 0) {
      const storedUser = JSON.parse(localStorage.getItem(keys[0]));
      setUser(storedUser);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);
  
  const login = (userData, adminId) => {
    setUser(userData);
    setIsAuthenticated(true);

    localStorage.setItem(
      `cafe_user_${adminId}`,
      JSON.stringify(userData)
    );
  };

  const logout = (adminId) => {
    if (adminId) {
      localStorage.removeItem(`cafe_user_${adminId}`);
    }
    localStorage.removeItem("active_cafe_user");

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook (clean usage)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
