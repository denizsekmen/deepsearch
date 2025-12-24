import { useState } from "react";
import Purchases from "react-native-purchases";
import { checkHasActiveEntitlements } from "../services/iap";
import LanguageService from "../services/languageService";

const useIAP = (isPremium, setIsPremium) => {
  const [isLoading, setIsLoading] = useState(true);

  const subscribe = async (productId, onSuccess, onError) => {
    try {
      const { customerInfo } = await Purchases.purchaseProduct(productId);
      if (checkHasActiveEntitlements(customerInfo.entitlements)) {
        setIsPremium(true);
        onSuccess();
      } else {
        alert(LanguageService.t("errorOccurred"));
        onError({ userCancelled: false });
      }
    } catch (e) {
      if (!e?.userCancelled) {
        alert(LanguageService.t("errorOccurred"));
      }
      // Her durumda error'ı geçir (userCancelled bilgisi ile)
      onError(e);
    }
  };

  const restorePurchase = async () => {
    if (!isPremium) {
      setIsLoading(true);
      try {
        const restore = await Purchases.restorePurchases();
        if (checkHasActiveEntitlements(restore.entitlements)) {
          setIsPremium(true);
          alert(LanguageService.t("subscriptionRestored"));
        } else {
          alert(LanguageService.t("noActiveSubscription"));
        }
      } catch (e) {
        console.log(e);
      }
      setIsLoading(false);
    } else {
      alert(LanguageService.t("alreadyPremium"));
    }
  };

  return {
    isLoading,
    subscribe,
    restorePurchase,
  };
};

export default useIAP;
