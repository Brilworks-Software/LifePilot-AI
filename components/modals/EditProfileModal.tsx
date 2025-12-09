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
                      <Ionicons name="person-circle" size={28} color="#6366F1" />
                    </View>
                    <Text style={styles.title}>Edit Profile</Text>
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
                  {/* Name Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="person-outline" size={16} color="#6366F1" />
                      <Text style={styles.label}>Full Name</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your name"
                      placeholderTextColor="#9CA3AF"
                      value={name}
                      onChangeText={onNameChange}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Email Input (Disabled, auto-filled) */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="mail-outline" size={16} color="#6366F1" />
                      <Text style={styles.label}>Email Address</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.input, styles.disabledInput]}
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        editable={false}
                      />
                      <View style={styles.lockIcon}>
                        <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                      </View>
                    </View>
                    <View style={styles.hintContainer}>
                      <Ionicons name="information-circle-outline" size={12} color="#6B7280" />
                      <Text style={styles.hintText}>Email cannot be changed</Text>
                    </View>
                  </View>

                  {/* Photo URL Input with Image Picker */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="image-outline" size={16} color="#6366F1" />
                      <Text style={styles.label}>Profile Picture</Text>
                    </View>
                    
                    {/* Preview Image if URL exists */}
                    {photoURL && (
                      <View style={styles.imagePreviewContainer}>
                        <Image 
                          source={{ uri: photoURL }} 
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                      </View>
                    )}

                    {/* Pick Image Button */}
                    <TouchableOpacity
                      style={styles.pickImageButton}
                      onPress={handlePickImage}
                      disabled={isPickingImage}
                      activeOpacity={0.7}
                    >
                      {isPickingImage ? (
                        <ActivityIndicator color="#6366F1" size="small" />
                      ) : (
                        <>
                          <Ionicons name="camera" size={20} color="#6366F1" />
                          <Text style={styles.pickImageButtonText}>
                            {photoURL ? 'Change Picture' : 'Pick from Gallery'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                  </View>

                  {/* Save Button */}
                  <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={onSave}
                    disabled={isSaving}
                    activeOpacity={0.8}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Save Changes</Text>
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
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
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
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    paddingRight: 40,
  },
  lockIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
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
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#6366F1',
  },
  pickImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 8,
  },
  pickImageButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6366F1',
    letterSpacing: 0.2,
  },
  orText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
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
    opacity: 0.7,
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

