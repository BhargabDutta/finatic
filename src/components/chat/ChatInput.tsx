import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask SubClear AI or paste bank SMS..."
          placeholderTextColor={COLORS.mutedText}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || disabled) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || disabled}
          activeOpacity={0.8}
        >
          {disabled ? (
            <ActivityIndicator size="small" color={COLORS.black} />
          ) : (
            <Text style={styles.sendButtonText}>SEND</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.paper,
    borderTopWidth: BRUTALIST.borderWidth,
    borderTopColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    backgroundColor: COLORS.white,
    borderWidth: BRUTALIST.borderWidthThin,
    borderColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.black,
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
    ...BRUTALIST.shadowSm,
  },
  sendButton: {
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: COLORS.yellow,
    borderWidth: BRUTALIST.borderWidthThin,
    borderColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    ...BRUTALIST.shadowSm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  sendButtonText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
});
