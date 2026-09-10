/**
 * CECUREUS — Registration Screen
 *
 * Fully integrated with the official CecureUs Design System:
 * - Brand Theme Colors: Primary Teal #00A99D, Mint #E6F7F5, Slate #0F172A
 * - Official CecureUs Logo & Card elevation
 * - Progressive Step-by-Step Inline OTP Verification:
 *   1. User enters Full Name & Mobile (+91)
 *   2. "Get OTP" button on right opens inline "Mobile OTP" input row below
 *   3. Verifying phone displays "Verified ✓" green pill and locks the field
 *   4. Email input unlocks ONLY after phone verification succeeds
 *   5. "Send OTP" button on right opens inline "Email OTP" row below
 *   6. Verifying email displays "Verified ✓" badge
 *   7. Agreement to Terms & Conditions checkbox
 *   8. Brand Teal "Create Account" button directly routes to authenticated Dashboard
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerWithOtp } = useAuth();

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [agreed, setAgreed] = useState(true);

  // Progressive Verification States
  const [isMobileOtpSent, setIsMobileOtpSent] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Loading States
  const [isRequestingMobileOtp, setIsRequestingMobileOtp] = useState(false);
  const [isVerifyingMobileOtp, setIsVerifyingMobileOtp] = useState(false);
  const [isRequestingEmailOtp, setIsRequestingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Timers
  const [mobileTimer, setMobileTimer] = useState(0);
  const [emailTimer, setEmailTimer] = useState(0);

  // Error & Status Banners
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mobile resend timer
  useEffect(() => {
    let interval: any = null;
    if (mobileTimer > 0) {
      interval = setInterval(() => setMobileTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mobileTimer]);

  // Email resend timer
  useEffect(() => {
    let interval: any = null;
    if (emailTimer > 0) {
      interval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer]);

  // ─── STEP 1: MOBILE OTP REQUEST ─────────────────────────────────
  const handleGetMobileOtp = async () => {
    const cleanMobile = mobile.replace(/[^0-9]/g, '').trim();
    if (!cleanMobile || cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    setSuccess('');
    setIsRequestingMobileOtp(true);

    try {
      const formattedPhone = cleanMobile.slice(-10);
      const response = await authApi.requestPhoneOtp({ phone: formattedPhone });
      setIsMobileOtpSent(true);
      setMobileTimer(30);
      setSuccess('Verification code sent to your mobile number.');

      if (response?.devOtpCode) {
        setMobileOtp(response.devOtpCode);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send mobile OTP. Please try again.');
    } finally {
      setIsRequestingMobileOtp(false);
    }
  };

  // ─── STEP 2: VERIFY MOBILE OTP ──────────────────────────────────
  const handleVerifyMobileOtp = async () => {
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
    const cleanCode = mobileOtp.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setError('');
    setSuccess('');
    setIsVerifyingMobileOtp(true);

    try {
      await authApi.verifyPhoneOtp({
        phone: cleanMobile,
        code: cleanCode,
      });

      setIsMobileVerified(true);
      setIsMobileOtpSent(false);
      setSuccess('Mobile number verified! You can now verify your email address.');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired mobile verification code.');
    } finally {
      setIsVerifyingMobileOtp(false);
    }
  };

  // ─── STEP 3: EMAIL OTP REQUEST (UNLOCKED ONLY AFTER MOBILE VERIFIED) ───
  const handleSendEmailOtp = async () => {
    if (!isMobileVerified) {
      setError('Please verify your mobile phone first');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setSuccess('');
    setIsRequestingEmailOtp(true);

    try {
      const response = await authApi.requestEmailOtp({ email: cleanEmail });
      setIsEmailOtpSent(true);
      setEmailTimer(30);
      setSuccess('Verification code dispatched to your email.');

      if (response?.devOtpCode) {
        setEmailOtp(response.devOtpCode);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch email verification code.');
    } finally {
      setIsRequestingEmailOtp(false);
    }
  };

  // ─── STEP 4: VERIFY EMAIL OTP ───────────────────────────────────
  const handleVerifyEmailOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = emailOtp.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setError('Please enter the 6-digit email OTP code');
      return;
    }

    setError('');
    setSuccess('');
    setIsVerifyingEmailOtp(true);

    try {
      await authApi.verifyEmailOtp({
        email: cleanEmail,
        code: cleanCode,
      });

      setIsEmailVerified(true);
      setIsEmailOtpSent(false);
      setSuccess('Email address verified successfully!');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired email verification code.');
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  // ─── STEP 5: FINAL SIGNUP ───────────────────────────────────────
  const handleSignup = async () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!isMobileVerified) {
      setError('Please verify your mobile number first');
      return;
    }
    if (!isEmailVerified) {
      setError('Please verify your email address first');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    setError('');
    setSuccess('');
    setIsSigningUp(true);

    try {
      const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
      await registerWithOtp({
        name: name.trim(),
        phone: cleanMobile,
        email: email.trim().toLowerCase(),
      });

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Registration could not be completed. Please try again.');
    } finally {
      setIsSigningUp(false);
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Row: Back button + CecureUs Official Logo */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <Logo size={42} variant="horizontal" />
            <View style={{ width: 40 }} />
          </View>

          {/* Form Card */}
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Create Account</Text>
              <Text style={styles.formSubtitle}>
                Join CecureUs for confidential mental wellness &amp; compassionate support
              </Text>
            </View>

            {/* Error Banner */}
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

            {/* Success Banner */}
            {!!success && (
              <View style={styles.successBanner}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={colors.success}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.successBannerText}>{success}</Text>
              </View>
            )}

            {/* Field 1: Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textMuted}
                  style={styles.leftIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Sainimal G E"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Field 2: Mobile Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mobile Phone</Text>
              <View
                style={[
                  styles.inputContainer,
                  isMobileVerified && styles.inputContainerVerified,
                ]}
              >
                {/* +91 Country Code Badge */}
                <View style={styles.countryBadge}>
                  <Text style={styles.countryBadgeText}>+91</Text>
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 9840893911"
                  placeholderTextColor={colors.textMuted}
                  value={mobile}
                  onChangeText={(val) => {
                    if (!isMobileVerified) {
                      setMobile(val);
                      setError('');
                    }
                  }}
                  keyboardType="phone-pad"
                  maxLength={13}
                  editable={!isMobileVerified}
                />

                {/* Right Action: Verified Badge or Get OTP Button */}
                {isMobileVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#059669"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.otpActionButton,
                      isMobileOtpSent && mobileTimer > 0 && styles.otpActionButtonDisabled,
                    ]}
                    onPress={handleGetMobileOtp}
                    disabled={isRequestingMobileOtp || (isMobileOtpSent && mobileTimer > 0)}
                    activeOpacity={0.7}
                  >
                    {isRequestingMobileOtp ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.otpActionButtonText}>
                        {isMobileOtpSent ? (mobileTimer > 0 ? `${mobileTimer}s` : 'Resend') : 'Get OTP'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Field 2b: Inline Mobile OTP Box (Appears right below Mobile when Get OTP is clicked) */}
            {isMobileOtpSent && !isMobileVerified && (
              <View style={styles.inlineOtpCard}>
                <View style={styles.inlineOtpHeader}>
                  <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                  <Text style={styles.inlineOtpTitle}>Enter Mobile Verification Code</Text>
                </View>

                <View style={styles.inlineOtpInputRow}>
                  <TextInput
                    style={styles.inlineOtpInput}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor={colors.textMuted}
                    value={mobileOtp}
                    onChangeText={setMobileOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={handleVerifyMobileOtp}
                    disabled={isVerifyingMobileOtp}
                    activeOpacity={0.7}
                  >
                    {isVerifyingMobileOtp ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.resendRow}>
                  <Text style={styles.resendTextMuted}>Didn't receive OTP? </Text>
                  {mobileTimer > 0 ? (
                    <Text style={styles.resendTextHighlight}>Resend in {mobileTimer}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleGetMobileOtp}>
                      <Text style={styles.resendTextHighlight}>Resend now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Field 3: Email (Disabled until Mobile is Verified) */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Email / Gmail Address</Text>
                {!isMobileVerified && (
                  <Text style={styles.stepHint}>Verify mobile first</Text>
                )}
              </View>

              <View
                style={[
                  styles.inputContainer,
                  !isMobileVerified && styles.inputContainerDisabled,
                  isEmailVerified && styles.inputContainerVerified,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={!isMobileVerified ? colors.textMuted : colors.primary}
                  style={styles.leftIcon}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. yourname@gmail.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    if (!isEmailVerified) {
                      setEmail(val);
                      setError('');
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={isMobileVerified && !isEmailVerified}
                />

                {/* Right Action: Verified Badge or Send OTP Button */}
                {isEmailVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#059669"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.otpActionButton,
                      (!isMobileVerified || (isEmailOtpSent && emailTimer > 0)) &&
                        styles.otpActionButtonDisabled,
                    ]}
                    onPress={handleSendEmailOtp}
                    disabled={!isMobileVerified || isRequestingEmailOtp || (isEmailOtpSent && emailTimer > 0)}
                    activeOpacity={0.7}
                  >
                    {isRequestingEmailOtp ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text
                        style={[
                          styles.otpActionButtonText,
                          !isMobileVerified && styles.otpActionButtonTextMuted,
                        ]}
                      >
                        {isEmailOtpSent ? (emailTimer > 0 ? `${emailTimer}s` : 'Resend') : 'Send OTP'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Field 4: Inline Email OTP Box (Appears right below Email when Send OTP is clicked) */}
            {isEmailOtpSent && !isEmailVerified && (
              <View style={styles.inlineOtpCard}>
                <View style={styles.inlineOtpHeader}>
                  <Ionicons name="mail-open" size={18} color={colors.primary} />
                  <Text style={styles.inlineOtpTitle}>Enter Email Verification Code</Text>
                </View>

                <View style={styles.inlineOtpInputRow}>
                  <TextInput
                    style={styles.inlineOtpInput}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor={colors.textMuted}
                    value={emailOtp}
                    onChangeText={setEmailOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={handleVerifyEmailOtp}
                    disabled={isVerifyingEmailOtp}
                    activeOpacity={0.7}
                  >
                    {isVerifyingEmailOtp ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.resendRow}>
                  <Text style={styles.resendTextMuted}>Didn't receive OTP? </Text>
                  {emailTimer > 0 ? (
                    <Text style={styles.resendTextHighlight}>Resend in {emailTimer}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleSendEmailOtp}>
                      <Text style={styles.resendTextHighlight}>Resend now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Terms & Conditions Agreement */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={[styles.checkboxBox, agreed && styles.checkboxBoxChecked]}
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.8}
              >
                {agreed && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    Alert.alert(
                      'Terms & Conditions',
                      'CecureUs delivers confidential, encrypted, and compassionate mental health counseling.'
                    )
                  }
                >
                  Terms &amp; Conditions
                </Text>{' '}
                &amp;{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    Alert.alert(
                      'Privacy Policy',
                      'Your privacy is guaranteed. Notes and conversations remain strictly confidential.'
                    )
                  }
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            {/* Brand Primary Action Button */}
            <Button
              title="Create Account"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSigningUp}
              disabled={!isMobileVerified || !isEmailVerified || !agreed || isSigningUp}
              onPress={handleSignup}
              style={{ marginTop: spacing.sm }}
            />

            {/* Login Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Login</Text>
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: borderRadius.md,
    padding: spacing.md,
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
    backgroundColor: colors.primaryBackground,
    borderWidth: 1,
    borderColor: '#CCF0EB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successBannerText: {
    ...typography.small,
    color: colors.primaryDark,
    fontWeight: '600',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.text,
    marginBottom: 6,
  },
  stepHint: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  inputContainer: {
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputContainerDisabled: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderLight,
    opacity: 0.75,
  },
  inputContainerVerified: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  leftIcon: {
    marginRight: 8,
  },
  countryBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.text,
  },
  otpActionButton: {
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#CCF0EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  otpActionButtonDisabled: {
    opacity: 0.5,
  },
  otpActionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  otpActionButtonTextMuted: {
    color: colors.textMuted,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  inlineOtpCard: {
    backgroundColor: colors.primaryBackground,
    borderWidth: 1.5,
    borderColor: '#CCF0EB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: -8,
    marginBottom: spacing.lg,
  },
  inlineOtpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  inlineOtpTitle: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  inlineOtpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineOtpInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: '#B2EBF2',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 2,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  resendTextMuted: {
    ...typography.small,
    color: colors.textMuted,
  },
  resendTextHighlight: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 6,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.captionBold,
    color: colors.primary,
  },
});
