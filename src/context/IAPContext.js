import { createContext, useContext } from 'react';

export const IAPContext = createContext({
  user: null,
});

export const useIAPContext = () => useContext(IAPContext);
