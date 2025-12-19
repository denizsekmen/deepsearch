import AsyncStorage from "@react-native-async-storage/async-storage";

export const checkIsOnboarded = async () => {
  const isOnboarded = await AsyncStorage.getItem("isOnboarded");
  return isOnboarded ? JSON.parse(isOnboarded) : false;
};

export const setIsOnboarded = async (value = true) => {
  return AsyncStorage.setItem("isOnboarded", JSON.stringify(value));
};
