import {createContext, useContext} from 'react';
import { COLOR } from '../theme';

export const AppContext = createContext({
  user: null,
  theme: {
    colors: COLOR,
    isDark: true,
  },
});

export const useAppContext = () => useContext(AppContext);
export const useTheme = () => {
  const context = useContext(AppContext);
  return {
    theme: context.theme || {
      colors: COLOR,
      isDark: true,
    }
  };
};
