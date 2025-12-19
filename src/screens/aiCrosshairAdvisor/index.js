import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useIAPContext } from "../../context/IAPContext";
import LinearGradient from "react-native-linear-gradient";
import { toWidth, toHeight } from "../../theme/helpers";
import { MMKV } from "react-native-mmkv";
import Typography from "../../components/Typography";
import Clipboard from "@react-native-clipboard/clipboard";
import SvgAsset from "../../components/SvgAsset";
import CrosshairAIService from "../../services/crosshairAIService";
import useCustomAlert from "../../hooks/useCustomAlert";
import CustomAlert from "../../components/modal/CustomAlert";

const storage = new MMKV();

const AICrosshairAdvisorScreen = () => {
  const { t, currentLanguage } = useLanguage();
  const { isPremium, showSubscriptionModal } = useIAPContext();
  const { alertConfig, showSuccess, showError, showConfirm, hideAlert } =
    useCustomAlert();

  useEffect(() => {
    if (!isPremium) {
      showSubscriptionModal();
    }
  }, []);

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: t("aiCrosshairWelcome"),
      isAI: true,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [selectedGame, setSelectedGame] = useState("cs2"); // cs2 or valorant
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessageCount();
  }, []);

  // Dil değiştiğinde welcome mesajını güncelle
  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: t("aiCrosshairWelcome"),
        isAI: true,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [currentLanguage]);

  const loadMessageCount = () => {
    try {
      const count = storage.getNumber("aiCrosshairMessageCount") || 0;
      setMessageCount(count);
    } catch (error) {
      console.error("Load message count error:", error);
    }
  };

  const incrementMessageCount = () => {
    try {
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      storage.set("aiCrosshairMessageCount", newCount);
    } catch (error) {
      console.error("Increment message count error:", error);
    }
  };

  // AI response generator - Real OpenAI Integration
  const generateAIResponse = async (userInput) => {
    try {
      const response = await CrosshairAIService.getCrosshairRecommendation(
        userInput,
        selectedGame,
        currentLanguage
      );

      // Kod varsa kod ile birlikte göster
      if (response.hasCode && response.code) {
        return {
          text: `${response.description}\n\n${t("recommendedCode")}:\n${
            response.code
          }`,
          code: response.code,
        };
      } else {
        // Sadece konuşma
        return {
          text: response.description,
          code: null,
        };
      }
    } catch (error) {
      console.error("AI Service Error:", error);

      // Fallback response
      return {
        text: `${t("aiServiceError")}\n\n${t("tryAgainLater")}`,
        code: null,
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Premium kontrolü - Free kullanıcı AI kullanamaz
    if (!isPremium && !__DEV__) {
      showConfirm(
        t("aiFeatureLocked"),
        t("aiFeatureLockedMessage"),
        () => showSubscriptionModal(),
        {
          confirmText: t("upgradeToPremium"),
          cancelText: t("cancel"),
          type: "warning",
        }
      );
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isAI: false,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText("");
    setIsTyping(true);

    // Real AI processing
    try {
      const aiResponse = await generateAIResponse(inputText.trim());

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isAI: true,
        timestamp: new Date().toISOString(),
        code: aiResponse.code,
      };

      setMessages([...newMessages, aiMessage]);
      setIsTyping(false);

      if (!isPremium) {
        incrementMessageCount();
      }
    } catch (error) {
      console.error("AI Response Error:", error);
      setIsTyping(false);
      showError(t("error"), t("aiResponseError"));
    }
  };

  const handleCopyCode = (code) => {
    Clipboard.setString(code);
    showSuccess(t("success"), t("crosshairCodeCopied"));
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isAI ? styles.aiMessageContainer : styles.userMessageContainer,
      ]}
    >
      {item.isAI ? (
        <View style={styles.aiMessageWrapper}>
          <LinearGradient
            colors={["#1a1a1a", "#2a2a2a"]}
            style={styles.aiMessageBubble}
          >
            <Text style={styles.aiMessageText}>{item.text}</Text>

            {item.code && (
              <TouchableOpacity
                style={styles.copyCodeButton}
                onPress={() => handleCopyCode(item.code)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"]}
                  style={styles.copyCodeGradient}
                >
                  <SvgAsset
                    name="document"
                    color="#FFFFFF"
                    style={styles.copyIcon}
                  />
                  <Text style={styles.copyCodeText}>{t("copyCode")}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
      ) : (
        <LinearGradient
          colors={["#1DB954", "#1ed760"]}
          style={styles.userMessageBubble}
        >
          <Text style={styles.userMessageText}>{item.text}</Text>
        </LinearGradient>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <LinearGradient
        colors={["#1a1a1a", "#2a2a2a"]}
        style={styles.typingBubble}
      >
        <View style={styles.typingDots}>
          <View style={[styles.typingDot, styles.typingDot1]} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
        </View>
      </LinearGradient>
    </View>
  );

  // Quick prompts
  const quickPrompts = [
    {
      id: "1",
      text: t("aggressivePlayStyle"),
      icon: "energy2",
      gradient: ["#FF6B6B", "#FF4757"],
      color: "#FF4757",
    },
    {
      id: "2",
      text: t("calmPlayStyle"),
      icon: "shield",
      gradient: ["#4CAF50", "#45a049"],
      color: "#4CAF50",
    },
    {
      id: "3",
      text: t("balancedPlayStyle"),
      icon: "magic_wand",
      gradient: ["#FFA726", "#FF9800"],
      color: "#FF9800",
    },
    {
      id: "4",
      text: t("proPlayStyle"),
      icon: "star3",
      gradient: ["#AB47BC", "#9C27B0"],
      color: "#9C27B0",
    },
  ];

  const handleQuickPrompt = (text) => {
    // Premium kontrolü - Free kullanıcı AI kullanamaz
    if (!isPremium && !__DEV__) {
      showConfirm(
        t("aiFeatureLocked"),
        t("aiFeatureLockedMessage"),
        () => showSubscriptionModal(),
        {
          confirmText: t("upgradeToPremium"),
          cancelText: t("cancel"),
          type: "warning",
        }
      );
      return;
    }

    setInputText(text);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIconContainer}>
              <SvgAsset
                name="bulb"
                color="#1DB954"
                style={styles.aiHeaderIcon}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Typography size={32} color="#f1f5f9" weight="900">
                {t("aiCrosshairAdvisor")}
              </Typography>
              <Typography
                size={12}
                color={isPremium ? "rgba(241, 245, 249, 0.7)" : "#FFD700"}
                weight="500"
              >
                {isPremium ? t("unlimitedMessages") : t("premiumRequired")}
              </Typography>
            </View>
          </View>
        </View>

        {/* Game Selector */}
        <View style={styles.gameSelector}>
          <TouchableOpacity
            style={[
              styles.gameTab,
              selectedGame === "cs2" && styles.activeGameTab,
            ]}
            onPress={() => setSelectedGame("cs2")}
            activeOpacity={0.8}
          >
            <Typography
              size={11}
              color={
                selectedGame === "cs2" ? "#FFFFFF" : "rgba(241, 245, 249, 0.6)"
              }
              weight="700"
            >
              CS2
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.gameTab,
              selectedGame === "valorant" && styles.activeGameTab,
            ]}
            onPress={() => setSelectedGame("valorant")}
            activeOpacity={0.8}
          >
            <Typography
              size={11}
              color={
                selectedGame === "valorant"
                  ? "#FFFFFF"
                  : "rgba(241, 245, 249, 0.6)"
              }
              weight="700"
            >
              VALORANT
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Quick Prompts - Horizontal */}
        {messages.length === 1 && (
          <View style={styles.quickPromptsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsScroll}
            >
              {quickPrompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt.id}
                  style={styles.quickPromptButton}
                  onPress={() => handleQuickPrompt(prompt.text)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={prompt.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.quickPromptGradient}
                  >
                    <SvgAsset
                      name={prompt.icon}
                      color="#FFFFFF"
                      style={styles.promptIcon}
                    />
                    <Typography size={11} color="#FFFFFF" weight="600">
                      {prompt.text}
                    </Typography>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 50);
          }}
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t("describePlayStyle")}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={
                inputText.trim() ? ["#1DB954", "#1ed760"] : ["#444", "#555"]
              }
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#121212",
  },
  header: {
    paddingHorizontal: toWidth(24),
    paddingTop: toHeight(16),
    paddingBottom: toHeight(12),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#121212",
    position: "relative",
    zIndex: 10,
  },
  gameSelector: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: toWidth(8),
    padding: toWidth(3),
    gap: toWidth(3),
    marginTop: toHeight(10),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  gameTab: {
    flex: 1,
    paddingVertical: toHeight(6),
    borderRadius: toWidth(6),
    alignItems: "center",
  },
  activeGameTab: {
    backgroundColor: "#1DB954",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: toWidth(12),
  },
  aiIconContainer: {
    width: toWidth(50),
    height: toWidth(50),
    borderRadius: toWidth(25),
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(29, 185, 84, 0.3)",
  },
  aiHeaderIcon: {
    width: toWidth(28),
    height: toWidth(28),
  },
  headerTextContainer: {
    gap: toHeight(2),
  },
  chatContainer: {
    flex: 1,
  },
  quickPromptsContainer: {
    paddingVertical: toHeight(12),
  },
  quickPromptsScroll: {
    paddingHorizontal: toWidth(20),
    gap: toWidth(10),
  },
  quickPromptButton: {
    borderRadius: toWidth(20),
    overflow: "hidden",
  },
  quickPromptGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: toWidth(6),
    paddingHorizontal: toWidth(14),
    paddingVertical: toHeight(8),
  },
  promptIcon: {
    width: toWidth(16),
    height: toWidth(16),
  },
  messagesList: {
    flex: 1,
    marginBottom: toHeight(40),
  },
  messagesContent: {
    padding: toWidth(20),
    paddingBottom: toHeight(100),
  },
  messageContainer: {
    marginVertical: toHeight(6),
    maxWidth: "85%",
  },
  aiMessageContainer: {
    alignSelf: "flex-start",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  aiMessageWrapper: {
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    overflow: "hidden",
  },
  aiMessageBubble: {
    padding: toWidth(12),
  },
  userMessageBubble: {
    padding: toWidth(12),
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiMessageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  userMessageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  copyCodeButton: {
    marginTop: toHeight(10),
    borderRadius: toWidth(8),
    overflow: "hidden",
  },
  copyCodeGradient: {
    padding: toWidth(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: toWidth(6),
  },
  copyIcon: {
    width: toWidth(14),
    height: toWidth(14),
  },
  copyCodeText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  typingContainer: {
    alignSelf: "flex-start",
    marginVertical: toHeight(8),
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    overflow: "hidden",
  },
  typingBubble: {
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(12),
  },
  typingDots: {
    flexDirection: "row",
    gap: toWidth(6),
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  inputContainer: {
    position: "absolute",
    bottom: toHeight(70),
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: toWidth(10),
    backgroundColor: "#1a1a1a",
    borderRadius: toWidth(24),
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(10),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: toHeight(8),
    paddingHorizontal: toWidth(4),
    textAlignVertical: "center",
  },
  sendButton: {
    borderRadius: toWidth(20),
    overflow: "hidden",
  },
  sendButtonGradient: {
    width: toWidth(40),
    height: toWidth(40),
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default AICrosshairAdvisorScreen;
