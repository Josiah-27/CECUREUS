/**
 * CECUREUS — Registration Screen
 *
 * Captures user details and initiates dual Phone & Gmail verification:
 * - Full Name
 * - Mobile Phone (+91)
 * - Gmail / Email
 * - Password
 * - "Create Account" -> Requests dual OTP and routes to Verification screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { authApi } from '../../services/api';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAccount = async () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid Gmail / email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await authApi.requestPhoneOtp({ phone: phone.trim() });

      // Navigate to OTP verification screen
      router.push({
        pathname: '/(auth)/otp',
        params: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server. Please check your network.');
    } finally {
      setIsSubmitting(false);
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
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Logo size={42} variant="horizontal" />
            <View style={{ width: 40 }} />
          </View>

          {/* Form Card */}
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Create Account</Text>
              <Text style={styles.formSubtitle}>
                Join CecureUs for confidential mental wellness support
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

            <Input
              label="Full Name"
              placeholder="e.g. Harsha Verma"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={20} color={colors.textMuted} />}
            />

            <Input
              label="Gmail / Email Address"
              placeholder="name@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
            />

            <Input
              label="Create Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
            />

            <Button
              title="Create Account"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              onPress={handleCreateAccount}
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
