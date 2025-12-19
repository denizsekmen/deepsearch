import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { checkIsOnboarded } from "../services/user";
import { handleTrackingPermission } from "../services/helper";
import { getPremiumState, getProducts, initPurchases } from "../services/iap";

const useInitApp = () => {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [products, setProducts] = useState({});
  const [isReady, setIsReady] = useState(true);
  useEffect(() => {
    initApp(false);
  }, []);

  const initApp = async (isReInit) => {
    try {
      setIsReady(false);
      StatusBar.setHidden(false);
      StatusBar.setBarStyle("dark-content");

      if (!isReInit) {
        handleTrackingPermission();
        initPurchases();
      }

      const [isOnboarded, prods, premiumState] = await Promise.all([
        checkIsOnboarded(),
        getProducts(),
        getPremiumState(),
      ]);

      // Set premium state from actual check
      setIsPremium(premiumState || false);
      setProducts(prods);

      setUser({ isOnboarded });
      setIsReady(true);
    } catch (e) {
      console.log(e);
    }
  };

  return {
    user,
    setUser,
    isReady,
    reInitApp: () => initApp(true),
    setIsPremium,
    isPremium,
    products,
  };
};

export default useInitApp;
