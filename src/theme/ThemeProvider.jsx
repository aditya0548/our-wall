import { createContext, useContext, useEffect } from 'react';
import useProfile from '../hooks/useProfile';

const ThemeContext = createContext();

export function ThemeProvider({ children, session }) {
  const { profile, partnerProfile, loading, refresh, updateProfile } = useProfile(session);
  const theme = profile?.theme || 'sakura';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, profile, partnerProfile, loading, refresh, updateProfile }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
