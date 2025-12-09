import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ChangePasswordModalProps {
  visible: boolean
  onClose: () => void
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
  onCurrentPasswordChange: (text: string) => void
  onNewPasswordChange: (text: string) => void
  onConfirmNewPasswordChange: (text: string) => void
  onSave: () => void
  isSaving: boolean
}

export function ChangePasswordModal({
  visible,
  onClose,
  currentPassword,
  newPassword,
  confirmNewPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmNewPasswordChange,
  onSave,
  isSaving,
}: ChangePasswordModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, color: '#E5E7EB', text: '' }
    if (password.length < 6) return { strength: 1, color: '#EF4444', text: 'Weak' }
    if (password.length < 10) return { strength: 2, color: '#F59E0B', text: 'Medium' }
    return { strength: 3, color: '#22C55E', text: 'Strong' }
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const passwordsMatch = newPassword && confirmNewPassword && newPassword === confirmNewPassword
  const passwordsMismatch = newPassword && confirmNewPassword && newPassword !== confirmNewPassword

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="lock-closed" size={28} color="#22C55E" />
                    </View>
                    <Text style={styles.title}>Change Password</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Body */}
                <ScrollView
                  style={styles.body}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Current Password Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="key-outline" size={16} color="#22C55E" />
                      <Text style={styles.label}>Current Password</Text>
                    </View>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter current password"
                        placeholderTextColor="#9CA3AF"
                        value={currentPassword}
                        onChangeText={onCurrentPasswordChange}
                        secureTextEntry={!showCurrentPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* New Password Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="lock-open-outline" size={16} color="#22C55E" />
                      <Text style={styles.label}>New Password</Text>
                    </View>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter new password"
                        placeholderTextColor="#9CA3AF"
                        value={newPassword}
                        onChangeText={onNewPasswordChange}
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>
                    {newPassword.length > 0 && (
                      <View style={styles.passwordStrengthContainer}>
                        <View style={styles.passwordStrengthBar}>
                          <View
                            style={[
                              styles.passwordStrengthFill,
                              {
                                width: `${(passwordStrength.strength / 3) * 100}%`,
                                backgroundColor: passwordStrength.color,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                          {passwordStrength.text || 'Too short'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.hintContainer}>
                      <Ionicons name="information-circle-outline" size={12} color="#6B7280" />
                      <Text style={styles.hintText}>Must be at least 6 characters</Text>
                    </View>
                  </View>

                  {/* Confirm New Password Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#22C55E" />
                      <Text style={styles.label}>Confirm New Password</Text>
                    </View>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        style={[
                          styles.passwordInput,
                          passwordsMatch && styles.passwordInputValid,
                          passwordsMismatch && styles.passwordInputInvalid,
                        ]}
                        placeholder="Confirm new password"
                        placeholderTextColor="#9CA3AF"
                        value={confirmNewPassword}
                        onChangeText={onConfirmNewPasswordChange}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                      {passwordsMatch && (
                        <View style={styles.checkIcon}>
                          <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                        </View>
                      )}
                      {passwordsMismatch && (
                        <View style={styles.checkIcon}>
                          <Ionicons name="close-circle" size={20} color="#EF4444" />
                        </View>
                      )}
                    </View>
                    {passwordsMatch && (
                      <View style={styles.hintContainer}>
                        <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
                        <Text style={[styles.hintText, styles.hintTextSuccess]}>
                          Passwords match
                        </Text>
                      </View>
                    )}
                    {passwordsMismatch && (
                      <View style={styles.hintContainer}>
                        <Ionicons name="close-circle" size={12} color="#EF4444" />
                        <Text style={[styles.hintText, styles.hintTextError]}>
                          Passwords do not match
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Save Button */}
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      isSaving && styles.saveButtonDisabled,
                      (!currentPassword || !newPassword || !confirmNewPassword || passwordsMismatch) &&
                        styles.saveButtonDisabled,
                    ]}
                    onPress={onSave}
                    disabled={
                      isSaving ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmNewPassword ||
                      passwordsMismatch
                    }
                    activeOpacity={0.8}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Change Password</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFBFC',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingRight: 80,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  passwordInputValid: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  passwordInputInvalid: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
    padding: 4,
  },
  checkIcon: {
    position: 'absolute',
    right: 44,
    top: 14,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  hintTextSuccess: {
    color: '#22C55E',
  },
  hintTextError: {
    color: '#EF4444',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
})

