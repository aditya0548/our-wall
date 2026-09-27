import { createContext, useContext } from 'react';
import useProfile from '../hooks/useProfile';

const ProfileContext = createContext();

export function ProfileProvider({ children, session }) {
  const { profile, partnerProfile, loading, refresh, updateProfile } = useProfile(session);

  return (
    <ProfileContext.Provider value={{ profile, partnerProfile, loading, refresh, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  return useContext(ProfileContext);
}
