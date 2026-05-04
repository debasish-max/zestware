import { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { isLoaded, user } = useUser();
  const { isSignedIn } = useClerkAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    if (!isSignedIn || !user) {
      setRole(null);
      setLoading(false);
      return;
    }

    // Derive role from Clerk publicMetadata
    // You should set this in Clerk Dashboard: user.update({ publicMetadata: { role: 'admin' } })
    const userRole = user.publicMetadata?.role || 'user';
    setRole(userRole);
    setLoading(false);
  }, [isLoaded, isSignedIn, user]);

  return (
    <AuthContext.Provider value={{ 
      user: isSignedIn ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        full_name: user.fullName,
        image_url: user.imageUrl
      } : null, 
      role, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
