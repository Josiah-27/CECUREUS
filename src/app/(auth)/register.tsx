/**
 * CECUREUS — Create an Account (Progressive Inline OTP Verification)
 *
 * Pixel-accurate implementation strictly matching the provided design:
 * - Top-right red '✕' close button
 * - Clean white card / modal framing
 * - "Full Name" input
 * - "Mobile" (+91 box) with "Get OTP" -> inline "Mobile OTP" with red outlined "Verify" -> "Verified ✓" green pill
 * - "Email" (enabled only after mobile is verified) with "Send OTP" -> inline "Email OTP" with red outlined "Verify" -> "Verified ✓" green pill
 * - Countdown timers ("Didn't receive OTP? Resend in 17s")
 * - Red square checkbox: "I agree to Terms & Conditions & Privacy Policy."
 * - Solid red "Signup" button
 * - "Already have an account? Login" footer
 */

import React, { useState, useEffect, useRef } from 'react';
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

  // Progressive Verification Flow States
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

  // Status & Error Banners
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mobile timer effect
  useEffect(() => {
    let interval: any = null;
    if (mobileTimer > 0) {
      interval = setInterval(() => setMobileTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mobileTimer]);

  // Email timer effect
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
      const formattedPhone = cleanMobile.startsWith('91') && cleanMobile.length === 12
        ? cleanMobile
        : cleanMobile.slice(-10);

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
      setError('Please enter the complete 6-digit OTP');
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
      setSuccess('Mobile number verified successfully! You can now verify your email.');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired mobile OTP. Please try again.');
    } finally {
      setIsVerifyingMobileOtp(false);
    }
  };

  // ─── STEP 3: EMAIL OTP REQUEST (UNLOCKED ONLY AFTER MOBILE VERIFIED) ───
  const handleSendEmailOtp = async () => {
    if (!isMobileVerified) {
      setError('Please verify your mobile number first');
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
      setError(err.message || 'Failed to send email OTP. Please check your address.');
    } finally {
      setIsRequestingEmailOtp(false);
    }
  };

  // ─── STEP 4: VERIFY EMAIL OTP ───────────────────────────────────
  const handleVerifyEmailOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = emailOtp.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setError('Please enter the complete 6-digit email OTP');
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
      setError(err.message || 'Invalid or expired email OTP. Please try again.');
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

      // Directly replace with Tabs Dashboard on successful signup
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Registration could not be completed. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card / Modal Container matching UI Mockup */}
          <View style={styles.cardContainer}>
            {/* Top Row: Close '✕' Button in Red */}
            <View style={styles.closeRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.closeButton}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={32} color="#FF1744" />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.titleText}>Create an account</Text>

            {/* Error / Success Feedback Banners */}
            {!!error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#D32F2F" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!!success && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={18} color="#2E7D32" style={{ marginRight: 6 }} />
                <Text style={styles.successText}>{success}</Text>
              </View>
            )}

            {/* Field 1: Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.singleTextInput}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Field 2: Mobile */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mobile</Text>
              <View style={[styles.inputRowContainer, isMobileVerified && styles.inputRowContainerVerified]}>
                {/* Left +91 Box */}
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>

                {/* Mobile Text Input */}
                <TextInput
                  style={styles.flexTextInput}
                  placeholder="Mobile Number"
                  placeholderTextColor="#94A3B8"
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

                {/* Right Action: "Verified ✓" Badge or "Get OTP" Button */}
                {isMobileVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedBadgeText}>Verified ✓</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isMobileOtpSent && mobileTimer > 0 && styles.actionButtonDisabled,
                    ]}
                    onPress={handleGetMobileOtp}
                    disabled={isRequestingMobileOtp || (isMobileOtpSent && mobileTimer > 0)}
                    activeOpacity={0.7}
                  >
                    {isRequestingMobileOtp ? (
                      <ActivityIndicator size="small" color="#475569" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {isMobileOtpSent ? (mobileTimer > 0 ? `${mobileTimer}s` : 'Resend') : 'Get OTP'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Field 2b: Inline Mobile OTP (Opens directly below Mobile when Get OTP is clicked) */}
            {isMobileOtpSent && !isMobileVerified && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Mobile OTP</Text>
                <View style={styles.inputRowContainer}>
                  <TextInput
                    style={styles.flexTextInputPadded}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#94A3B8"
                    value={mobileOtp}
                    onChangeText={setMobileOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.verifyRedButton}
                    onPress={handleVerifyMobileOtp}
                    disabled={isVerifyingMobileOtp}
                    activeOpacity={0.7}
                  >
                    {isVerifyingMobileOtp ? (
                      <ActivityIndicator size="small" color="#FF1744" />
                    ) : (
                      <Text style={styles.verifyRedButtonText}>Verify</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Mobile Resend Countdown */}
                <View style={styles.resendPromptRow}>
                  <Text style={styles.resendTextMuted}>Didn't receive OTP? </Text>
                  {mobileTimer > 0 ? (
                    <Text style={styles.resendTextRed}>Resend in {mobileTimer}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleGetMobileOtp}>
                      <Text style={styles.resendTextRed}>Resend now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Field 3: Email (Disabled until Mobile is Verified) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View
                style={[
                  styles.inputRowContainer,
                  !isMobileVerified && styles.inputRowContainerDisabled,
                  isEmailVerified && styles.inputRowContainerVerified,
                ]}
              >
                <TextInput
                  style={styles.flexTextInputPadded}
                  placeholder="name@gmail.com"
                  placeholderTextColor="#94A3B8"
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

                {/* Right Action: "Verified ✓" Badge or "Send OTP" Button */}
                {isEmailVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedBadgeText}>Verified ✓</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      (!isMobileVerified || (isEmailOtpSent && emailTimer > 0)) && styles.actionButtonDisabled,
                    ]}
                    onPress={handleSendEmailOtp}
                    disabled={!isMobileVerified || isRequestingEmailOtp || (isEmailOtpSent && emailTimer > 0)}
                    activeOpacity={0.7}
                  >
                    {isRequestingEmailOtp ? (
                      <ActivityIndicator size="small" color="#475569" />
                    ) : (
                      <Text
                        style={[
                          styles.actionButtonText,
                          !isMobileVerified && styles.actionButtonTextDisabled,
                        ]}
                      >
                        {isEmailOtpSent ? (emailTimer > 0 ? `${emailTimer}s` : 'Resend') : 'Send OTP'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Field 4: Inline Email OTP (Opens directly below Email when Send OTP is clicked) */}
            {isEmailOtpSent && !isEmailVerified && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email OTP</Text>
                <View style={styles.inputRowContainer}>
                  <TextInput
                    style={styles.flexTextInputPadded}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#94A3B8"
                    value={emailOtp}
                    onChangeText={setEmailOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.verifyRedButton}
                    onPress={handleVerifyEmailOtp}
                    disabled={isVerifyingEmailOtp}
                    activeOpacity={0.7}
                  >
                    {isVerifyingEmailOtp ? (
                      <ActivityIndicator size="small" color="#FF1744" />
                    ) : (
                      <Text style={styles.verifyRedButtonText}>Verify</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Email Resend Countdown exactly matching screenshot */}
                <View style={styles.resendPromptRow}>
                  <Text style={styles.resendTextMuted}>Didn't receive OTP? </Text>
                  {emailTimer > 0 ? (
                    <Text style={styles.resendTextRed}>Resend in {emailTimer}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleSendEmailOtp}>
                      <Text style={styles.resendTextRed}>Resend now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Terms & Conditions Checkbox Row */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={[styles.checkboxBox, agreed && styles.checkboxBoxChecked]}
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.8}
              >
                {agreed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    Alert.alert(
                      'Terms & Conditions',
                      'CecureUs provides confidential, encrypted mental wellness and counseling support services.'
                    )
                  }
                >
                  Terms & Conditions
                </Text>{' '}
                &{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    Alert.alert(
                      'Privacy Policy',
                      'Your privacy is our highest priority. All your notes, chats, and therapy sessions remain strictly confidential.'
                    )
                  }
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            {/* Primary Signup Button */}
            <TouchableOpacity
              style={[
                styles.signupButton,
                (!isMobileVerified || !isEmailVerified || !agreed || isSigningUp) &&
                  styles.signupButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={!isMobileVerified || !isEmailVerified || !agreed || isSigningUp}
              activeOpacity={0.85}
            >
              {isSigningUp ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Signup</Text>
              )}
            </TouchableOpacity>

            {/* Footer: Already have an account? Login */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLoginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  singleTextInput: {
    height: 52,
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputRowContainer: {
    height: 52,
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  inputRowContainerDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  inputRowContainerVerified: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  countryCodeBox: {
    width: 58,
    height: '100%',
    backgroundColor: '#E2E8F0',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  flexTextInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000000',
  },
  flexTextInputPadded: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#000000',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  actionButtonTextDisabled: {
    color: '#94A3B8',
  },
  verifiedBadge: {
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  verifiedBadgeText: {
    color: '#1E8E3E',
    fontWeight: '700',
    fontSize: 13,
  },
  verifyRedButton: {
    borderWidth: 1.5,
    borderColor: '#FF1744',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  verifyRedButtonText: {
    color: '#FF1744',
    fontWeight: '700',
    fontSize: 14,
  },
  resendPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  resendTextMuted: {
    fontSize: 13,
    color: '#475569',
  },
  resendTextRed: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF1744',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxBoxChecked: {
    backgroundColor: '#FF1744',
    borderColor: '#FF1744',
  },
  termsText: {
    fontSize: 13.5,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: '#FF1744',
    fontWeight: '600',
  },
  signupButton: {
    height: 52,
    backgroundColor: '#FF0000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  signupButtonDisabled: {
    backgroundColor: '#FFA4B2',
    shadowOpacity: 0,
    elevation: 0,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#111827',
  },
  footerLoginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF1744',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  successText: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: '600',
    flex: 1,
  },
});
