import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { Stack, Link, router } from 'expo-router'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { useAuth } from '@/firebase/hooks/useAuth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ email?: string }>({})
  const [isEmailSent, setIsEmailSent] = useState(false)

  const { resetPassword, isResettingPassword } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: { email?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await resetPassword(email.trim())
      setIsEmailSent(true)
    } catch (error: any) {
      if(Platform.OS === 'web'){
        alert(error.message || 'An error occurred. Please try again.')
      } else{
        Alert.alert(
            'Reset Password Failed',
            error.message || 'An error occurred. Please try again.',
            [{ text: 'OK' }]
          )
      }
    }
  }

  if (isEmailSent) {
    return (
      <Container>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.successContent}>
              <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successMessage}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
              <Text style={styles.instructionText}>
                Please check your inbox and follow the instructions to reset your password.
              </Text>
              <Button
                title="Back to Sign In"
                onPress={() => router.replace('/(auth)/login')}
                style={styles.backButton}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Container>
    )
  }

  return (
    <Container>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text)
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined })
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <Button
                title={isResettingPassword ? 'Sending...' : 'Send Reset Link'}
                onPress={handleResetPassword}
                disabled={isResettingPassword}
                style={styles.resetButton}
              />

              <View style={styles.backToLoginContainer}>
                <Text style={styles.backToLoginText}>Remember your password? </Text>
                <Link href="/(auth)/login" asChild>
                  <Text style={styles.backToLoginLink}>Sign In</Text>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  resetButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  backToLoginLink: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    marginTop: 8,
  },
})