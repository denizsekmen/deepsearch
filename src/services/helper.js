import { Linking, Platform, Share } from "react-native";
import { getLocales } from "react-native-localize";
import Toast from "react-native-toast-message";
import FastImage from "react-native-fast-image";
import { PERMISSIONS, RESULTS, check, request } from "react-native-permissions";
import Purchases from "react-native-purchases";

export const checkPhotoSavePermission = async () => {
  let granted = false;
  let error = null;

  check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY).then((result) => {
    switch (result) {
      case RESULTS.UNAVAILABLE:
        error =
          "This feature is not available (on this device / in this context)";
        break;
      case RESULTS.DENIED:
        break;
      case RESULTS.LIMITED:
        granted = true;
        break;
      case RESULTS.GRANTED:
        granted = true;
        break;
      case RESULTS.BLOCKED:
        error = "The permission is denied and not requestable anymore";
        break;
    }
  });

  return { error, granted };
};

export const requestPhotoSavePermission = async () => {
  const permission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
  return permission === RESULTS.GRANTED;
};

export const openSettings = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    Linking.openSettings();
  }
};

export const showBottomInfoToast = (text) => {
  Toast.show({
    type: "info",
    text1: text,
    position: "top",
    visibilityTime: 3000,
  });
};

export const cacheOnboardingImages = (images = []) => {
  if (Array.isArray(images)) {
    const extractedImages = images.filter((img) => !img.includes("mp4"));
    FastImage.preload(extractedImages.map((i) => ({ uri: i })));
  }
};

export const cahceLoginImage = (references) => {
  try {
    if (references?.loginImage) {
      FastImage.preload([{ uri: references?.loginImage }]);
    }
  } catch (e) {
    console.log(e);
  }
};

export const handleTrackingPermission = async () => {
  const { granted, error } = await checkTrackingPermission();

  if (granted) {
    console.log("Tracking permission is granted");
  } else {
    if (!error) {
      const isAllowed = await requestTrackingPermission();
      console.log("Tracking permission is requested: ", isAllowed);
      if (isAllowed) {
        Purchases.collectDeviceIdentifiers();
      }
    } else {
      console.log("Tracking permission error: ", error);
    }
  }
};

export const checkTrackingPermission = async () => {
  let granted = false;
  let error = null;

  check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY).then((result) => {
    switch (result) {
      case RESULTS.UNAVAILABLE:
        error =
          "This feature is not available (on this device / in this context)";
        break;
      case RESULTS.DENIED:
        break;
      case RESULTS.LIMITED:
        granted = true;
        break;
      case RESULTS.GRANTED:
        granted = true;
        break;
      case RESULTS.BLOCKED:
        error = "The permission is denied and not requestable anymore";
        break;
    }
  });

  return { error, granted };
};

export const requestTrackingPermission = async () => {
  const permission = await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
  return permission === RESULTS.GRANTED;
};

export const getTimezoneOffset = () => {
  const now = new Date();
  const timezoneOffsetInMinutes = now.getTimezoneOffset();

  return timezoneOffsetInMinutes;
};

export const getCurrentLangCode = () => {
  const locales = getLocales();

  const langCode = locales[0].languageCode;
  // return ['tr', 'en', 'ar'].includes(langCode) ? langCode : 'en';
  return "en";
};

export const handleLanguage = () => {
  //TODO: refactoring, doing the same thing with the getCurrentLangCode function
  // const langCode = getCurrentLangCode();
  // const lang = ['en', 'tr', 'ar'].includes(langCode) ? langCode : 'en';
  // return lang;
  return "en";
};

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

export function convertMsToTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;
  return `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
}

export const convertSecondsToTime = (seconds) => {
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  return `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
};

export const shareApp = async (data, appLink = "http://bernsoftware.com") => {
  try {
    const message = `Let’s create a summarize with AI Video Summarize! (${appLink})! `;
    const result = await Share.share({ message });
  } catch (error) {
    console.log("Error sharing app: ", error);
  }
};

export const getAppLinkFromReferences = (appLink) => {
  return appLink?.[Platform.OS];
};
