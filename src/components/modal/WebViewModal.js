import React, { useCallback } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { WebView } from "react-native-webview";
import BackDrop from "../../components/BottomSheetBackdrop";
import { toWidth } from "../../theme/helpers";
import { StyleSheet } from "react-native";

export default function WebViewModal({
  close = () => {},
  source = "http://bernsoftware.com",
}) {
  const sheetRef = React.useRef(null);

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      close();
    }
  }, []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={["80%"]}
      backgroundStyle={{ borderRadius: toWidth(30) }}
      animateOnMount
      onChange={handleSheetChanges}
      backdropComponent={BackDrop}
      enablePanDownToClose
    >
      <WebView source={{ uri: source }} style={styles.container} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%" },
});
