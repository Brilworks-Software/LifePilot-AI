import React, { useEffect, useState } from 'react'
import { Modal, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  visible: boolean
  onClose: () => void
  onDelete: (password: string) => Promise<void> | void
  isDeleting?: boolean
  isReauthenticating?: boolean
  styles: any
}

export const DeleteAccountModal: React.FC<Props> = ({
  visible,
  onClose,
  onDelete,
  isDeleting = false,
  isReauthenticating = false,
  styles,
}) => {
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  useEffect(() => {
    if (!visible) {
      setDeletePassword('')
      setShowDeletePassword(false)
    }
  }, [visible])

  const handlePressDelete = async () => {
    await onDelete(deletePassword)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, styles.deleteTitle]}>Delete Account</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.warningText}>
              This action cannot be undone. All your data will be permanently deleted.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Enter your password to confirm</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  secureTextEntry={!showDeletePassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowDeletePassword(!showDeletePassword)}
                >
                  <Ionicons
                    name={showDeletePassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={handlePressDelete}
              disabled={isDeleting || isReauthenticating}
            >
              {(isDeleting || isReauthenticating) ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalButtonText}>Delete Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

export default DeleteAccountModal