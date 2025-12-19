import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import React from "react";
import { byHeight, byWidth, toHeight, toWidth } from "../theme/helpers";
import { APP_SPESIFIC_COLOR } from "../theme";
import LottieView from "lottie-react-native";
import Typography from "./Typography";

export default function LoadingModal({ text = "Loading..." }) {
  return (
    <Modal style={styles.container} transparent visible>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={"black"} />
        <Typography
          color={"black"}
          center
          style={{
            width: byWidth(60),
          }}
        >
          {text}
        </Typography>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: byWidth(100),
    height: byHeight(100),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
