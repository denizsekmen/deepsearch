import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import Walkthrough from "../screens/walkthrough/Walkthrough";
import Tabs from "./Tabs";
import LoadingModal from "../components/LoadingModal";

const Stack = createNativeStackNavigator();

export default function Navigator({ navigationRef }) {
  const { user, isReady } = useAppContext();

  if (!isReady) return <LoadingModal />;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user.isOnboarded ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} />
          </>
        ) : (
          <Stack.Screen name="Walkthrough" component={Walkthrough} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
