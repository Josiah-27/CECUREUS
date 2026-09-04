/**
 * CECUREUS — Sequential Account Verification Screen (Step 1: Phone, Step 2: Gmail)
 *
 * Implements strict sequential verification matching UX design principles:
 * - Step 1: Mobile Phone OTP Verification (logged in terminal for instant testing)
 * - Step 2: Gmail OTP Verification (sent to Gmail inbox & logged in terminal)
 * - Step Progress Bar
 * - "Verify & Complete Registration"
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { saveAuthToken, saveUserProfile } from '../../services/storage';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

export default function OtpVerificationScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const params = useLocalSearchParams<{
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    initialPhoneOtp?: string;
  }>();

  const name = params.name || 'New User';
  const phone = params.phone || '';
  const email = params.email || '';
  const password = params.password || '';

  // 1 = Phone Verification, 2 = Gmail Verification
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const phoneInputs = useRef<Array<TextInput | null>>([]);
  const emailInputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePhoneOtpChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const newOtp = [...phoneOtp];
    newOtp[index] = cleaned.slice(-1);
    setPhoneOtp(newOtp);

    if (cleaned && index < 5) {
      phoneInputs.current[index + 1]?.focus();
    }
  };

  const handlePhoneOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !phoneOtp[index] && index > 0) {
      phoneInputs.current[index - 1]?.focus();
    }
  };

  const handleEmailOtpChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const newOtp = [...emailOtp];
    newOtp[index] = cleaned.slice(-1);
    setEmailOtp(newOtp);

    if (cleaned && index < 5) {
      emailInputs.current[index + 1]?.focus();
    }
  };

  const handleEmailOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !emailOtp[index] && index > 0) {
      emailInputs.current[index - 1]?.focus();
    }
  };

  // Step 1: Verify Phone Number
  const handleVerifyPhone = async () => {
    const phoneCode = phoneOtp.join('');
    if (phoneCode.length !== 6) {
      setError('Please enter the 6-digit phone verification code');
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      await authApi.verifyPhoneStep({
        phone,
        code: phoneCode,
        email,
      });

      setCurrentStep(2);
      setSuccessMsg('Phone verified! A 6-digit code has been sent to your Gmail inbox.');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Invalid phone verification code. Check terminal or retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Verify Gmail and Complete Registration
  const handleVerifyEmail = async () => {
    const emailCode = emailOtp.join('');
    if (emailCode.length !== 6) {
      setError('Please enter the 6-digit Gmail verification code');
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      const response = await authApi.registerWithOtp({
        name,
        phone,
        email,
        password,
        emailOtp: emailCode,
      });

      const authToken = response.session?.token || 'session_' + Date.now();
      const accountUser = response.account || {
        id: 'usr_' + Date.now(),
        name,
        phone,
        email,
        phone_verified: 1,
        email_verified: 1,
      };

      await saveAuthToken(authToken);
      await saveUserProfile(accountUser);
      setUser(accountUser);

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Invalid Gmail verification code. Check inbox or terminal.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setSuccessMsg('');
    setResendTimer(60);

    try {
      if (currentStep === 1) {
        await authApi.requestPhoneOtp({ phone });
        setSuccessMsg('New phone verification code generated. Check terminal (pm2 logs).');
      } else {
        await authApi.requestEmailOtp({ email });
        setSuccessMsg('New verification code dispatched to your Gmail inbox.');
      }
    } catch {
      // Keep going
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                if (currentStep === 2) {
                  setCurrentStep(1);
                  setError('');
                } else {
                  router.back();
                }
              }}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Logo size={42} variant="horizontal" />
            <View style={{ width: 40 }} />
          </View>

          {/* Step Progress Tracker */}
          <View style={styles.stepProgressCard}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepBadge,
                  currentStep === 1 && styles.stepBadgeActive,
                  currentStep === 2 && styles.stepBadgeCompleted,
                ]}
              >
                {currentStep === 2 ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepBadgeText,
                      currentStep === 1 && styles.stepBadgeTextActive,
                    ]}
                  >
                    1
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep === 1 && styles.stepLabelActive,
                  currentStep === 2 && styles.stepLabelCompleted,
                ]}
              >
                Phone
              </Text>
            </View>

            <View
              style={[
                styles.stepLine,
                currentStep === 2 && styles.stepLineCompleted,
              ]}
            />

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepBadge,
                  currentStep === 2 && styles.stepBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepBadgeText,
                    currentStep === 2 && styles.stepBadgeTextActive,
                  ]}
                >
                  2
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep === 2 && styles.stepLabelActive,
                ]}
              >
                Gmail
              </Text>
            </View>
          </View>

          {/* Verification Form Card */}
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {currentStep === 1 ? 'Verify Phone Number' : 'Verify Gmail Address'}
              </Text>
              <Text style={styles.formSubtitle}>
                {currentStep === 1
                  ? 'Step 1 of 2: Confirm your mobile number to proceed'
                  : 'Step 2 of 2: Confirm your email to complete registration'}
              </Text>
            </View>

            {!!error && (
              <View style={styles.errorBanner}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.error}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            {!!successMsg && (
              <View style={styles.successBanner}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#059669"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.successBannerText}>{successMsg}</Text>
              </View>
            )}

            {/* Step 1: Phone Verification Input */}
            {currentStep === 1 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="phone-portrait-outline" size={18} color={colors.primary} />
                  <Text style={styles.sectionLabel}>Mobile Verification</Text>
                </View>
                <Text style={styles.sectionSubtext}>
                  Enter the 6-digit code for <Text style={styles.highlightText}>{phone || 'your phone'}</Text>
                </Text>

                <View style={styles.terminalNoticePill}>
                  <Ionicons name="terminal-outline" size={14} color="#0D9488" style={{ marginRight: 4 }} />
                  <Text style={styles.terminalNoticeText}>
                    Code visible in terminal logs (run: pm2 logs)
                  </Text>
                </View>

                <View style={styles.otpRow}>
                  {phoneOtp.map((digit, idx) => (
                    <TextInput
                      key={`phone_otp_${idx}`}
                      ref={(el) => {
                        phoneInputs.current[idx] = el;
                      }}
                      style={[styles.otpBox, !!digit && styles.otpBoxFilled]}
                      value={digit}
                      onChangeText={(text) => handlePhoneOtpChange(text, idx)}
                      onKeyPress={(e) => handlePhoneOtpKeyPress(e, idx)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      autoFocus={idx === 0}
                    />
                  ))}
                </View>

                <Button
                  title="Verify Phone Number"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isVerifying}
                  onPress={handleVerifyPhone}
                  style={{ marginTop: spacing.lg }}
                />
              </View>
            )}

            {/* Step 2: Gmail Verification Input */}
            {currentStep === 2 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="mail-outline" size={18} color={colors.secondary} />
                  <Text style={styles.sectionLabel}>Gmail Verification</Text>
                </View>
                <Text style={styles.sectionSubtext}>
                  Enter the 6-digit code sent to <Text style={styles.highlightText}>{email || 'your Gmail'}</Text>
                </Text>

                <View style={styles.terminalNoticePill}>
                  <Ionicons name="mail-open-outline" size={14} color="#0D9488" style={{ marginRight: 4 }} />
                  <Text style={styles.terminalNoticeText}>
                    Dispatched to your Gmail inbox
                  </Text>
                </View>

                <View style={styles.otpRow}>
                  {emailOtp.map((digit, idx) => (
                    <TextInput
                      key={`email_otp_${idx}`}
                      ref={(el) => {
                        emailInputs.current[idx] = el;
                      }}
                      style={[styles.otpBox, !!digit && styles.otpBoxFilled]}
                      value={digit}
                      onChangeText={(text) => handleEmailOtpChange(text, idx)}
                      onKeyPress={(e) => handleEmailOtpKeyPress(e, idx)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      autoFocus={idx === 0}
                    />
                  ))}
                </View>

                <Button
                  title="Verify Gmail & Complete Registration"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isVerifying}
                  onPress={handleVerifyEmail}
                  style={{ marginTop: spacing.lg }}
                />
              </View>
            )}

            {/* Resend Action */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendTimer > 0}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resendLink,
                    resendTimer > 0 && { color: colors.textMuted },
                  ]}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepProgressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: colors.primary,
  },
  stepBadgeCompleted: {
    backgroundColor: '#10B981',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    ...typography.captionBold,
    color: '#94A3B8',
  },
  stepLabelActive: {
    color: colors.primaryDark,
  },
  stepLabelCompleted: {
    color: '#10B981',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: spacing.md,
  },
  stepLineCompleted: {
    backgroundColor: '#10B981',
  },
  formCard: {
    padding: spacing.xl,
    marginVertical: spacing.xs,
  },
  formHeader: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    ...typography.h2,
    color: colors.text,
    fontSize: 22,
    marginBottom: 4,
  },
  formSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionLabel: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 15,
  },
  sectionSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  highlightText: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  terminalNoticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  terminalNoticeText: {
    ...typography.small,
    fontSize: 11,
    color: '#0F766E',
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  otpBox: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDFA',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    ...typography.small,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  successBannerText: {
    ...typography.small,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: 6,
  },
  resendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  resendLink: {
    ...typography.captionBold,
    color: colors.primary,
  },
});
