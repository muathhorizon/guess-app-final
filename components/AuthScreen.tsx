import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { LogIn, Mail } from 'lucide-react-native';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [authMethod, setAuthMethod] = useState<'manual' | 'otp'>('manual');

  const { loginManual, sendOtp, verifyOtp, loading, error, clearError } = useAuthStore();
  const { colors } = useThemeStore();

  const handleManualLogin = async () => {
    if (!name.trim() || !email.trim()) {
      return;
    }

    try {
      await loginManual(name, email);
      onAuthSuccess();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      return;
    }

    try {
      await sendOtp(email);
      setShowOtp(true);
    } catch (err) {
      console.error('Failed to send OTP:', err);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      return;
    }

    try {
      await verifyOtp(email, otp);
      onAuthSuccess();
    } catch (err) {
      console.error('OTP verification failed:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome to GS Pro
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Sign in to start playing
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                { borderColor: colors.border },
                authMethod === 'manual' && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                setAuthMethod('manual');
                setShowOtp(false);
                clearError();
              }}
            >
              <LogIn
                size={20}
                color={authMethod === 'manual' ? '#fff' : colors.text}
              />
              <Text
                style={[
                  styles.methodText,
                  {
                    color: authMethod === 'manual' ? '#fff' : colors.text,
                  },
                ]}
              >
                Manual Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                { borderColor: colors.border },
                authMethod === 'otp' && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                setAuthMethod('otp');
                setShowOtp(false);
                clearError();
              }}
            >
              <Mail
                size={20}
                color={authMethod === 'otp' ? '#fff' : colors.text}
              />
              <Text
                style={[
                  styles.methodText,
                  {
                    color: authMethod === 'otp' ? '#fff' : colors.text,
                  },
                ]}
              >
                Email OTP
              </Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          {authMethod === 'manual' ? (
            <>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Full Name"
                placeholderTextColor={colors.secondaryText}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={colors.secondaryText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  loading && styles.disabledButton,
                ]}
                onPress={handleManualLogin}
                disabled={loading || !name.trim() || !email.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {!showOtp ? (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="Email"
                    placeholderTextColor={colors.secondaryText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      { backgroundColor: colors.primary },
                      loading && styles.disabledButton,
                    ]}
                    onPress={handleSendOtp}
                    disabled={loading || !email.trim()}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.otpInfo, { color: colors.secondaryText }]}>
                    Enter the OTP sent to {email}
                  </Text>

                  <TextInput
                    style={[
                      styles.input,
                      styles.otpInput,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="Enter OTP"
                    placeholderTextColor={colors.secondaryText}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      { backgroundColor: colors.primary },
                      loading && styles.disabledButton,
                    ]}
                    onPress={handleVerifyOtp}
                    disabled={loading || !otp.trim()}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleSendOtp}
                    disabled={loading}
                  >
                    <Text style={[styles.resendText, { color: colors.primary }]}>
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  otpInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
