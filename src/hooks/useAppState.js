import {useEffect} from 'react';
import {AppState} from 'react-native';

const useAppState = () => {
  useEffect(() => {
    try {
      const listener = AppState.addEventListener(
        'change',
        handleAppStateChange,
      );
      return () => listener.remove();
    } catch (e) {
      console.log(e);
    }
  }, []);

  const handleAppStateChange = nextAppState => {
    if (nextAppState === 'inactive') {
    
    }
  };
};

export default useAppState;
