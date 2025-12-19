import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../../context/LanguageContext";
import { useIAPContext } from "../../context/IAPContext";
import { useNavigation } from "@react-navigation/native";
import { toWidth, toHeight } from "../../theme/helpers";
import Typography from "../../components/Typography";
import SvgAsset from "../../components/SvgAsset";
import useCustomAlert from "../../hooks/useCustomAlert";
import CustomAlert from "../../components/modal/CustomAlert";
import { INSTAGRAM_COLORS } from "../../theme/instagramColors";
import peopleSearchAIService from "../../services/peopleSearchAIService";

const AISearchAssistantScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { isPremium, showSubscriptionModal } = useIAPContext();
  const { alertConfig, showSuccess, showError, showConfirm, hideAlert } =
    useCustomAlert();

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: t('aiWelcome'),
      isAI: true,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  
  // Helper function to trigger search directly
  const triggerSearch = async (searchType) => {
    if (!isPremium) {
      showSubscriptionModal();
      return;
    }

    // Create a search prompt
    const searchPrompt = t(`searchBy${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`);
    
    // Set input text
    setInputText(searchPrompt);
    
    // Wait for state update then trigger search
    setTimeout(async () => {
      if (!searchPrompt.trim()) return;

      const userMessage = {
        id: Date.now().toString(),
        text: searchPrompt,
        isAI: false,
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInputText("");
      setIsTyping(true);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        const aiResponse = await generateAIResponse(searchPrompt);
        const searchInfo = peopleSearchAIService.extractSearchInfo(searchPrompt);

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.text,
          isAI: true,
          timestamp: new Date().toISOString(),
          suggestions: aiResponse.suggestions,
          searchResults: aiResponse.searchResults || null,
          query: searchInfo.query || null,
          searchType: searchInfo.type || searchType || null,
        };

        setMessages([...newMessages, aiMessage]);
        setIsTyping(false);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error("AI Response Error:", error);
        setIsTyping(false);
        showError(t('error'), t('failedToGetAIResponse'));
      }
    }, 100);
  };


  // AI response generator with real search and OpenAI integration
  const generateAIResponse = async (userInput) => {
    try {
      // First, try to perform search and analyze
      const searchAnalysis = await peopleSearchAIService.searchAndAnalyze(userInput);
      
      if (searchAnalysis) {
        return searchAnalysis;
      }

      // If no search intent, use general AI response
      const generalResponse = await peopleSearchAIService.getGeneralAIResponse(userInput);
      return generalResponse;
    } catch (error) {
      console.error("AI Response Error:", error);
      
      // Fallback to simple pattern matching if AI fails
      const input = userInput.toLowerCase();

      if (input.includes("who is") || input.includes("bu kişi kim")) {
        return {
          text: t('aiResponseWhoIs'),
          suggestions: [t('searchByName'), t('searchByEmail'), t('searchByUsername')],
        };
      }

      if (input.includes("platform") || input.includes("hangi platform")) {
        return {
          text: t('aiResponseUsernameCheck'),
          suggestions: [t('searchByUsername')],
        };
      }

      if (input.includes("real") || input.includes("gerçek") || input.includes("verify")) {
        return {
          text: t('aiResponseVerifyEmail'),
          suggestions: [t('searchByEmail'), t('searchByUsername')],
        };
      }

      // Default response
      return {
        text: t('aiResponseDefault'),
        suggestions: [t('searchByName'), t('searchByEmail'), t('searchByUsername')],
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Premium check
    if (!isPremium) {
      showSubscriptionModal();
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

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const aiResponse = await generateAIResponse(inputText.trim());

      // Extract search info for navigation
      const searchInfo = peopleSearchAIService.extractSearchInfo(inputText.trim());

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isAI: true,
        timestamp: new Date().toISOString(),
        suggestions: aiResponse.suggestions,
        searchResults: aiResponse.searchResults || null,
        query: searchInfo.query || null,
        searchType: searchInfo.type || null,
      };

      setMessages([...newMessages, aiMessage]);
      setIsTyping(false);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("AI Response Error:", error);
      setIsTyping(false);
      showError(t('error'), t('failedToGetAIResponse'));
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isAI ? styles.aiMessageContainer : styles.userMessageContainer,
      ]}
    >
      {item.isAI && (
        <View style={styles.aiAvatar}>
          <Typography size={16} color={INSTAGRAM_COLORS.textPrimary} weight="700">
            AI
          </Typography>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.isAI ? styles.aiBubble : styles.userBubble,
        ]}
      >
        <Typography
          size={14}
          color={item.isAI ? INSTAGRAM_COLORS.textPrimary : INSTAGRAM_COLORS.textPrimary}
          weight="400"
          style={styles.messageText}
        >
          {item.text}
        </Typography>
        {item.suggestions && item.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {item.suggestions.map((suggestion, index) => {
              // Check if suggestion is a search action
              const handleSuggestionPress = () => {
                // Check if suggestion matches "View {source} profile" pattern
                const viewProfilePattern = t('viewProfile').replace('{source}', '');
                if (suggestion.includes(viewProfilePattern) && item.searchResults) {
                  // Extract source name from suggestion
                  const sourceName = suggestion.replace(viewProfilePattern.split('{source}')[0], '').replace(viewProfilePattern.split('{source}')[1] || '', '');
                  const result = item.searchResults.find(r => r.sourceName === sourceName);
                  if (result) {
                    navigation.navigate('ProfileDetail', {
                      result: result,
                      query: item.query || '',
                      type: item.searchType || 'name',
                    });
                  }
                } else if (suggestion === t('searchByName') || suggestion === t('searchByEmail') || suggestion === t('searchByPhone') || suggestion === t('searchByUsername')) {
                  // Extract search type from suggestion
                  let type = "name";
                  if (suggestion === t('searchByName')) type = "name";
                  else if (suggestion === t('searchByEmail')) type = "email";
                  else if (suggestion === t('searchByPhone')) type = "phone";
                  else if (suggestion === t('searchByUsername')) type = "username";
                  
                  // Ask AI for a person to search
                  const prompt = type === "name"
                    ? t('aiPromptSearchName')
                    : type === "email"
                    ? t('aiPromptSearchEmail')
                    : type === "phone"
                    ? t('aiPromptSearchPhone')
                    : t('aiPromptSearchUsername');
                  
                  // Set input and trigger AI response
                  setInputText(prompt);
                  setTimeout(() => {
                    handleSearchByType(prompt, type);
                  }, 200);
                } else {
                  // Default: set as input text and auto-send
                  setInputText(suggestion);
                  setTimeout(() => {
                    handleSendMessage();
                  }, 200);
                }
              };

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={handleSuggestionPress}
                  activeOpacity={0.7}
                >
                  <Typography size={12} color={INSTAGRAM_COLORS.textLink} weight="600">
                    {suggestion}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
      {!item.isAI && (
        <View style={styles.userAvatar}>
          <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="600">
            {t('you')}
          </Typography>
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessageContainer]}>
      <View style={styles.aiAvatar}>
        <Typography size={16} color={INSTAGRAM_COLORS.textPrimary} weight="700">
          AI
        </Typography>
      </View>
      <View style={[styles.messageBubble, styles.aiBubble]}>
        <ActivityIndicator size="small" color={INSTAGRAM_COLORS.textSecondary} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Instagram-style Header */}
        <View style={styles.header}>
          <Typography
            size={18}
            color={INSTAGRAM_COLORS.textPrimary}
            weight="700"
            style={styles.headerTitle}
          >
            {t('aiAssistant')}
          </Typography>
        </View>

        {!isPremium ? (
          // Premium Lock Screen
          <View style={styles.lockContainer}>
            <View style={styles.lockContent}>
              <View style={styles.lockIconContainer}>
                <SvgAsset
                  name="lock"
                  color={INSTAGRAM_COLORS.textSecondary}
                  style={styles.lockIcon}
                />
              </View>
              <Typography
                size={24}
                color={INSTAGRAM_COLORS.textPrimary}
                weight="700"
                style={styles.lockTitle}
              >
                {t('aiPremiumLockTitle')}
              </Typography>
              <Typography
                size={16}
                color={INSTAGRAM_COLORS.textPrimary}
                weight="600"
                style={styles.lockDescription}
              >
                {t('aiPremiumLockDescription')}
              </Typography>
              <Typography
                size={14}
                color={INSTAGRAM_COLORS.textSecondary}
                weight="400"
                style={styles.lockSubtitle}
              >
                {t('aiPremiumLockSubtitle')}
              </Typography>
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={showSubscriptionModal}
                activeOpacity={0.8}
              >
                <View style={styles.unlockButtonInner}>
                  <Typography size={16} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                    {t('upgradeToPremium')}
                  </Typography>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.contentContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={isTyping ? renderTypingIndicator : null}
              />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
              style={styles.keyboardView}
            >
              <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={inputText}
                      onChangeText={setInputText}
                      placeholder={t('aiPlaceholder')}
                      placeholderTextColor={INSTAGRAM_COLORS.textTertiary}
                      multiline
                      maxLength={500}
                      returnKeyType="send"
                      onSubmitEditing={handleSendMessage}
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        !inputText.trim() && styles.sendButtonDisabled,
                      ]}
                      onPress={handleSendMessage}
                      disabled={!inputText.trim()}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.sendButtonInner, !inputText.trim() && styles.sendButtonDisabledInner]}>
                        <SvgAsset
                          name="angle_right"
                          color={inputText.trim() ? INSTAGRAM_COLORS.textPrimary : INSTAGRAM_COLORS.textTertiary}
                          style={styles.sendIcon}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            </KeyboardAvoidingView>
          </>
        )}
      </SafeAreaView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(8),
    paddingBottom: toHeight(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  headerTitle: {
    marginBottom: toHeight(2),
  },
  headerSubtitle: {
    // Left aligned
  },
  contentContainer: {
    flex: 1,
  },
  keyboardView: {
    position: 'absolute',
    bottom: toHeight(70), // Tab bar height
    left: 0,
    right: 0,
  },
  inputSafeArea: {
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  messagesList: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(16),
    paddingBottom: toHeight(160), // Space for input (60) + tab bar (70) + safe area (30)
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: toHeight(16),
    alignItems: "flex-end",
  },
  aiMessageContainer: {
    justifyContent: "flex-start",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  aiAvatar: {
    width: toWidth(32),
    height: toWidth(32),
    borderRadius: toWidth(16),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: toWidth(8),
  },
  userAvatar: {
    width: toWidth(32),
    height: toWidth(32),
    borderRadius: toWidth(16),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: toWidth(8),
  },
  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: toWidth(32),
    paddingBottom: toHeight(90), // Tab bar height
  },
  lockContent: {
    alignItems: 'center',
    width: '100%',
  },
  lockIconContainer: {
    width: toWidth(80),
    height: toWidth(80),
    borderRadius: toWidth(40),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: toHeight(24),
  },
  lockIcon: {
    width: toWidth(40),
    height: toWidth(40),
  },
  lockTitle: {
    textAlign: 'center',
    marginBottom: toHeight(12),
  },
  lockDescription: {
    textAlign: 'center',
    marginBottom: toHeight(8),
  },
  lockSubtitle: {
    textAlign: 'center',
    marginBottom: toHeight(32),
  },
  unlockButton: {
    borderRadius: toWidth(8),
    overflow: 'hidden',
    width: '100%',
  },
  unlockButtonInner: {
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    paddingVertical: toHeight(16),
    paddingHorizontal: toWidth(32),
    borderRadius: toWidth(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: toWidth(12),
    paddingVertical: toHeight(10),
    borderRadius: toWidth(18),
  },
  aiBubble: {
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  userBubble: {
    backgroundColor: INSTAGRAM_COLORS.buttonPrimary,
  },
  messageText: {
    lineHeight: 20,
  },
  suggestionsContainer: {
    marginTop: toHeight(8),
    gap: toHeight(6),
  },
  suggestionButton: {
    paddingVertical: toHeight(6),
    paddingHorizontal: toWidth(10),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(8),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  inputContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: INSTAGRAM_COLORS.border,
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(12),
    paddingBottom: toHeight(12),
    backgroundColor: INSTAGRAM_COLORS.background,
    minHeight: toHeight(60),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(24),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    paddingHorizontal: toWidth(12),
    paddingVertical: toHeight(8),
    minHeight: toHeight(44),
  },
  textInput: {
    flex: 1,
    color: INSTAGRAM_COLORS.textPrimary,
    fontSize: 15,
    maxHeight: toHeight(100),
    paddingVertical: toHeight(8),
    textAlignVertical: 'center',
  },
  sendButton: {
    marginLeft: toWidth(8),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonInner: {
    width: toWidth(32),
    height: toWidth(32),
    borderRadius: toWidth(16),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabledInner: {
    backgroundColor: INSTAGRAM_COLORS.buttonDisabled,
  },
  sendIcon: {
    width: toWidth(16),
    height: toHeight(16),
  },
});

export default AISearchAssistantScreen;

