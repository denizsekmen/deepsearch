import "./global.css";
import React from "react";
import { AppContext } from "./src/context/AppContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import Navigator from "./src/navigation/Navigator";
import useInitApp from "./src/hooks/useInitApp";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useNavigationContainerRef } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import IAPProvider from "./src/providers/IAPProvider";
import useAppState from "./src/hooks/useAppState";

function App() {
  useAppState();

  const { products, isPremium, setIsPremium, ...appDetails } = useInitApp();

  const navigationRef = useNavigationContainerRef();

  return (
    <ActionSheetProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <LanguageProvider>
              <AppContext.Provider
                value={{
                  ...appDetails,
                }}
              >
                <IAPProvider
                  products={products}
                  isPremium={isPremium}
                  setIsPremium={setIsPremium}
                >
                  <Navigator navigationRef={navigationRef} />
                  <Toast />
                </IAPProvider>
              </AppContext.Provider>
            </LanguageProvider>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ActionSheetProvider>
  );
}

export default App;
