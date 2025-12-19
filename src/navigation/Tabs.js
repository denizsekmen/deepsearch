import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TabBarIcon from "./TabBarIcon";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchHomeScreen from "../screens/search/SearchHomeScreen";
import SearchResultsScreen from "../screens/search/SearchResultsScreen";
import ProfileDetailScreen from "../screens/search/ProfileDetailScreen";
import SearchHistoryScreen from "../screens/search/SearchHistoryScreen";
import TrendingScreen from "../screens/search/TrendingScreen";
import LegalScreen from "../screens/search/LegalScreen";
import AISearchAssistantScreen from "../screens/aiAssistant";
import FavoritesScreen from "../screens/favorites";
import Settings from "../screens/settings";
import { useLanguage } from "../context/LanguageContext";

const Tab = createBottomTabNavigator();
const SearchStack = createNativeStackNavigator();
const AIAssistantStack = createNativeStackNavigator();
const FavoritesStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

const SearchStackScreen = () => {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
      }}
    >
      <SearchStack.Screen
        name="SearchHome"
        component={SearchHomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <SearchStack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{
          headerShown: false,
        }}
      />
      <SearchStack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <SearchStack.Screen
        name="SearchHistory"
        component={SearchHistoryScreen}
        options={{
          headerShown: false,
        }}
      />
      <SearchStack.Screen
        name="Trending"
        component={TrendingScreen}
        options={{
          headerShown: false,
        }}
      />
      <SearchStack.Screen
        name="Legal"
        component={LegalScreen}
        options={{
          headerShown: false,
        }}
      />
    </SearchStack.Navigator>
  );
};

const AIAssistantStackScreen = () => {
  return (
    <AIAssistantStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
      }}
    >
      <AIAssistantStack.Screen
        name="AIAssistant"
        component={AISearchAssistantScreen}
        options={{
          headerShown: false,
        }}
      />
    </AIAssistantStack.Navigator>
  );
};

const FavoritesStackScreen = () => {
  return (
    <FavoritesStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
      }}
    >
      <FavoritesStack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          headerShown: false,
        }}
      />
    </FavoritesStack.Navigator>
  );
};


function SettingsScreenFunc() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown: false,
        }}
      />
    </SettingsStack.Navigator>
  );
}

function Tabs() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPadding = Math.max(12, insets.bottom);
  const baseHeight = 70;
  return (
    <Tab.Navigator
      initialRouteName="SearchFunc"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          marginTop: 40,
          backgroundColor: "#000000",
          bottom: 0, // Tab bar'ı en alta yapıştır
          height: baseHeight + bottomPadding,
          paddingBottom: bottomPadding,
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          borderTopWidth: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} route={route} />
        ),
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.4)",
      })}
    >
      <Tab.Screen
        name="SearchFunc"
        component={SearchStackScreen}
        options={() => ({
          title: t('search'),
          tabBarLabel: t('search')
        })}
      />

      <Tab.Screen
        name="AIAssistantFunc"
        component={AIAssistantStackScreen}
        options={() => ({
          title: t('ai'),
          tabBarLabel: t('ai')
        })}
      />

      <Tab.Screen
        name="FavoritesFunc"
        component={FavoritesStackScreen}
        options={() => ({ 
          title: t('favorites'), 
          tabBarLabel: t('favorites') 
        })}
      />

      <Tab.Screen
        name="SettingsFunc"
        component={SettingsScreenFunc}
        options={() => ({
          title: t('settings'),
          tabBarLabel: t('settings'),
        })}
      />
    </Tab.Navigator>
  );
}

export default Tabs;
