import React, { useMemo } from "react";
import SvgAsset from "../components/SvgAsset";
import { toWidth } from "../theme/helpers";

export default function TabBarIcon({ focused, route }) {
  const iconName = useMemo(() => {
    if (route.name === "SearchFunc") {
      return "search";
    } else if (route.name === "AIAssistantFunc") {
      return "bulb";
    } else if (route.name === "FavoritesFunc") {
      return "heart";
    } else if (route.name === "SettingsFunc") {
      return "gear";
    }
    return "search"; // Default
  }, [route.name]);

  return (
    <SvgAsset
      name={iconName}
      style={{ width: toWidth(22), height: toWidth(22) }}
      color={focused ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)"}
    />
  );
}
