/**
 * CECUREUS — Sign In / Login Screen
 *
 * Clean, minimal, high-aesthetic login screen:
 * - Official brand logo
 * - Phone & password inputs
 * - Primary "Login" button
 * - Create account link
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setError('Please enter your phone number or email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    setError('');
    try {
      await login(identifier.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <Logo size={76} variant="vertical" />
            <Text style={styles.tagline}>
              Your safe sanctuary for mental wellness &amp; support
            </Text>
          </View>

          {/* Login Form Card */}
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Login</Text>
              <Text style={styles.formSubtitle}>
                Enter your credentials to access your account
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
              label="Phone Number or Email"
              placeholder="e.g. 9840893911 or your@email.com"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
            />

            <Button
              title="Login"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleLogin}
              style={{ marginTop: spacing.sm }}
            />

            {/* Register Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Create Account</Text>
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tagline: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
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
