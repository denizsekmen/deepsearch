import { Platform } from "react-native";
import Purchases from "react-native-purchases";

export const initPurchases = async (id) => {
  if (Platform.OS === "ios") {
    await Purchases.configure({
      apiKey: "appl_zCwxSRoWFVCVsqZsdLARTUrifyH",
      appUserID: id,
    });
  } else if (Platform.OS === "android") {
    await Purchases.configure({
      apiKey: "appl_zCwxSRoWFVCVsqZsdLARTUrifyH",
      appUserID: id,
    });
  }
};

export const getProducts = async () => {
  const offerings = await Purchases.getOfferings();
  const credit = offerings?.current?.availablePackages?.filter(
    (pkg) => pkg?.packageType === "CUSTOM"
  );
  const subscription = offerings?.current?.availablePackages?.filter(
    (pkg) => pkg?.packageType !== "CUSTOM"
  );
  const annual = subscription.find((pkg) => pkg?.packageType === "ANNUAL");
  const weekly = subscription.find((pkg) => pkg?.packageType === "WEEKLY");

  return { credit, subscription: { annual, weekly } };
};

export const getPremiumState = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return checkHasActiveEntitlements(customerInfo.entitlements);
  } catch (error) {
    console.error("Premium state check error:", error);
    return false; // Hata durumunda premium değil kabul et
  }
};

export const checkHasActiveEntitlements = (entitlements) => {
  return Object.keys(entitlements?.active || {}).length > 0;
};
