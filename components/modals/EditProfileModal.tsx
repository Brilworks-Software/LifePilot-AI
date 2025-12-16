import React from 'react'
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
  Image,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { pickImageToBase64, base64ToImageUri } from '@/services/imageConversationService'

interface EditProfileModalProps {
  visible: boolean
  onClose: () => void
  name: string
  email: string
  photoURL: string
  onNameChange: (text: string) => void
  onPhotoURLChange: (text: string) => void
  onSave: () => void
  isSaving: boolean
}

export function EditProfileModal({
  visible,
  onClose,
  name,
  email,
  photoURL,
  onNameChange,
  onPhotoURLChange,
  onSave,
  isSaving,
}: EditProfileModalProps) {
  const [isPickingImage, setIsPickingImage] = React.useState(false)

  const handlePickImage = async () => {
    try {
      setIsPickingImage(true)
      const base64Image = await pickImageToBase64()
      if (base64Image) {
        const imageUri = base64ToImageUri(base64Image)
        onPhotoURLChange(imageUri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
    } finally {
      setIsPickingImage(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose}>
          {/* Modal Container */}
          <Pressable style={styles.modalContainer} onPress={() => {}}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Ionicons name="person-circle" size={28} color="#6366F1" />
                  <Text style={styles.title}>Edit Profile</Text>
                </View>
                <Pressable onPress={onClose} hitSlop={10}>
                  <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                </Pressable>
              </View>

              {/* Scrollable Body */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                contentContainerStyle={styles.body}
              >
                {/* Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={onNameChange}
                  />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.input, styles.disabledInput]}
                      value={email}
                      editable={false}
                    />
                    <Ionicons
                      name="lock-closed"
                      size={16}
                      color="#9CA3AF"
                      style={styles.lockIcon}
                    />
                  </View>
                </View>

                {/* Profile Image */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Profile Picture</Text>

                  {photoURL && (
                    <Image
                      source={{ uri: photoURL }}
                      style={styles.imagePreview}
                    />
                  )}

                  <Pressable
                    style={styles.pickImageButton}
                    onPress={handlePickImage}
                    disabled={isPickingImage}
                  >
                    {isPickingImage ? (
                      <ActivityIndicator color="#6366F1" />
                    ) : (
                      <>
                        <Ionicons name="camera" size={20} color="#6366F1" />
                        <Text style={styles.pickImageButtonText}>
                          {photoURL ? 'Change Picture' : 'Pick from Gallery'}
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={[styles.saveButton, isSaving && styles.disabled]}
                  onPress={onSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>Save Changes</Text>
                  )}
                </Pressable>

                <Pressable onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    maxHeight: '90%',
    borderRadius: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    padding: 24,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  lockIcon: {
    position: 'absolute',
    right: 14,
    top: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickImageButton: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  pickImageButtonText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  actions: {
    borderTopWidth: 1,
    borderColor: '#eee',
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#6B7280',
  },
  disabled: {
    opacity: 0.7,
  },
});


