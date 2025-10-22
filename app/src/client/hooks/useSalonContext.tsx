import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from 'wasp/client/auth';

interface SalonContextType {
  activeSalonId: string | null;
  setActiveSalonId: (salonId: string) => void;
  userSalons: { id: string; name: string }[];
  setUserSalons: (salons: { id: string; name: string }[]) => void;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export function SalonProvider({ children }: { children: ReactNode }) {
  const { data: user } = useAuth();
  const [activeSalonId, setActiveSalonIdState] = useState<string | null>(null);
  const [userSalons, setUserSalons] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (user?.activeSalonId) {
      setActiveSalonIdState(user.activeSalonId);
    }
  }, [user]);

  const setActiveSalonId = (salonId: string) => {
    setActiveSalonIdState(salonId);
    // TODO: Update user's activeSalonId in the backend
  };

  return (
    <SalonContext.Provider
      value={{
        activeSalonId,
        setActiveSalonId,
        userSalons,
        setUserSalons,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
}

export function useSalonContext() {
  const context = useContext(SalonContext);
  if (context === undefined) {
    throw new Error('useSalonContext must be used within a SalonProvider');
  }
  return context;
}
