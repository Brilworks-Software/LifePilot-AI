import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { Stack, Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { useAuth } from '@/firebase/hooks/useAuth'
import { useCreateUser } from '@/firebase/hooks/useUser'
import { pickImageToBase64 } from '@/services/imageConversationService'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [photoURL, setPhotoURL] = useState<string>('')
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSelectingImage, setIsSelectingImage] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; photoURL?: string }>({})

  const { signUp, signUpError, isSigningUp } = useAuth();
  const createUser = useCreateUser();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }

  const pickImage = async () => {
    try {
      setIsSelectingImage(true)
      const result = await pickImageToBase64();
      if (result) {
        setPhotoURL(`data:image/jpeg;base64,${result}`);
        setPhotoPreview(`data:image/jpeg;base64,${result}`);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Failed to pick image. Please try again.')
      } else {
        Alert.alert('Error', 'Failed to pick image. Please try again.', [{ text: 'OK' }])
      }
    } finally {
      setIsSelectingImage(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string; photoURL?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!photoURL) {
      newErrors.photoURL = 'Profile photo is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async () => {
    if (!validateForm()) {
      return
    }

    try {
      // Sign up with Firebase Auth
      const userCredential = await signUp({
        email: email.trim(),
        password,
        name: name.trim(),
        photoURL: photoURL,
      })

        // Navigate to onboarding or home
        router.replace('/')
      
    } catch (error: any) {
      if (Platform.OS == 'web') {
        alert(error.message || 'An error occurred during sign up. Please try again.')
      } else {
        Alert.alert(
          'Sign Up Failed',
          error.message || 'An error occurred during sign up. Please try again.',
          [{ text: 'OK' }]
        )
      }
    }
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
            <Text style={styles.title}>Welcome to LifePilot</Text>
            <Text style={styles.subtitle}>Create your account to get started</Text>

            {/* Photo Upload Section - Centered at top */}
            <View style={styles.photoSection}>
              {photoPreview ? (
                <View style={styles.selectedPhotoContainer}>
                  <Image source={{ uri: photoPreview }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={pickImage}
                    disabled={isSelectingImage}
                  >
                    <Ionicons name="camera" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.photoContainer, errors.photoURL && styles.photoContainerError]}
                  onPress={pickImage}
                  disabled={isSelectingImage}
                >
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              )}
              {errors.photoURL && <Text style={styles.photoErrorText}>{errors.photoURL}</Text>}
            </View>
          
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={(text) => {
                    setName(text)
                    if (errors.name) {
                      setErrors({ ...errors, name: undefined })
                    }
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

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

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text)
                      if (errors.password) {
                        setErrors({ ...errors, password: undefined })
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                <Text style={styles.hintText}>Must be at least 6 characters</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text)
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: undefined })
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <Button
                title={isSigningUp ? 'Creating Account...' : 'Create Account'}
                onPress={handleSignUp}
                disabled={isSigningUp}
                style={styles.signUpButton}
              />

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <Text style={styles.loginLink}>Sign In</Text>
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
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  photoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  photoContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  selectedPhotoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#333',
    borderWidth: 1,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 80,
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 3,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  photoErrorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
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
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
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
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  signUpButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
})