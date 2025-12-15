import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Platform, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Container } from '@/components/Container'
import { EditProfileModal } from '@/components/modals/EditProfileModal'
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal'
import DeleteAccountModal from '@/components/modals/DeleteAccountModal'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '@/firebase/hooks/useAuth'
import { useUser, useUpdateUser } from '@/firebase/hooks/useUser'
import { usePostHog } from 'posthog-react-native'

export default function settings() {
  const { currentUser: user,  deleteAccount, reauthenticate, updatePassword, signOut,  isDeletingAccount, isSigningOut, isReauthenticating, isUpdatingPassword,  } = useAuth()
  const { data: userProfile, isLoading: profileLoading } = useUser(user?.uid || '')
  const updateUserMutation = useUpdateUser()
  const posthog = usePostHog();

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhotoURL, setEditPhotoURL] = useState('')
  // added state for date (birth date / editable date)
  useEffect(() => {
        posthog.capture("Settings screen loaded, user Id: " + posthog.getDistinctId());
    }, [])
  useEffect(() => {
    
    if (userProfile) {
      console.log(`userProfile: ${JSON.stringify(userProfile)}`);
      
      setEditName(userProfile.name || '')
      setEditEmail(userProfile.email || '')
      setEditPhotoURL(userProfile.photoURL || '')
      // initialize editDate from profile (try common keys)
    }
  }, [userProfile])

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out?')
      console.log(confirmed);
      
      if (!confirmed) {
        console.log("User cancel the Logout");
        return;
        
      }
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut()
                router.replace('/(auth)/login')
              } catch (error: any) {
                if (Platform.OS === 'web') {
                  alert(error.message || 'Failed to log out. Please try again.')
                } else {
                  Alert.alert('Log Out Failed', error.message || 'Failed to log out. Please try again.')
                }
              }
            },
          },
        ]
      )
      return
    }

    try {
      await signOut()
      router.replace('/(auth)/login')
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(error.message || 'Failed to log out. Please try again.')
      } else {
        Alert.alert('Log Out Failed', error.message || 'Failed to log out. Please try again.')
      }
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmNewPassword || !currentPassword) {
      if (Platform.OS === 'web') {
        alert('Please fill in all password fields')
      } else {
        Alert.alert('Error', 'Please fill in all password fields')
      }
      return
    }

    if (newPassword.length < 6) {
      if (Platform.OS === 'web') {
        alert('New password must be at least 6 characters')
      } else {
        Alert.alert('Error', 'New password must be at least 6 characters')
      }
      return
    }

    if (newPassword !== confirmNewPassword) {
      if (Platform.OS === 'web') {
        alert('New passwords do not match')
      } else {
        Alert.alert('Error', 'New passwords do not match')
      }
      return
    }

    try {
      // Re-authenticate first
      await reauthenticate(currentPassword)
      // Update password
      await updatePassword(newPassword)
      
      if (Platform.OS === 'web') {
        alert('Password changed successfully')
      } else {
        Alert.alert('Success', 'Password changed successfully')
      }
      
      setShowChangePasswordModal(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(error.message || 'Failed to change password. Please try again.')
      } else {
        Alert.alert('Error', error.message || 'Failed to change password. Please try again.')
      }
    }
  }

  const handleDeleteAccount = async (password?: string) => {
    const pw = password ?? deletePassword

    if (!pw) {
      if (Platform.OS === 'web') {
        alert('Please enter your password to confirm account deletion')
      } else {
        Alert.alert('Error', 'Please enter your password to confirm account deletion')
      }
      return
    }

    try {
      // Re-authenticate first
      await reauthenticate(pw)
      // Delete account
      await deleteAccount()
      
      if (Platform.OS === 'web') {
        alert('Account deleted successfully')
      } else {
        Alert.alert('Success', 'Account deleted successfully')
      }
      
      router.replace('/(auth)/login')
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(error.message || 'Failed to delete account. Please try again.')
      } else {
        Alert.alert('Error', error.message || 'Failed to delete account. Please try again.')
      }
    }
  }

  const handleUpdateProfile = async () => {
    if (!user?.uid) return

    if (!editName.trim()) {
      if (Platform.OS === 'web') {
        alert('Name is required')
      } else {
        Alert.alert('Error', 'Name is required')
      }
      return
    }

    try {
      await updateUserMutation.mutateAsync({
        userId: user?.uid || '',
        updates: {
          name: editName.trim(),
          photoURL: editPhotoURL.trim() || undefined,
          // include date in the updates (store under birthDate)
        }
      })
      
      if (Platform.OS === 'web') {
        alert('Profile updated successfully')
      } else {
        Alert.alert('Success', 'Profile updated successfully')
      }
      
      setShowEditProfileModal(false)
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(error.message || 'Failed to update profile. Please try again.')
      } else {
        Alert.alert('Error', error.message || 'Failed to update profile. Please try again.')
      }
    }
  }

  const profileImageUri = userProfile?.photoURL || user?.photoURL || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'

  if (profileLoading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </Container>
    )
  }

  return (
    <Container>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={() => setShowEditProfileModal(true)}
          >
            <Image
              source={{ uri: profileImageUri }}
              style={styles.profileImage}
            />
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{userProfile?.name || user?.email || 'User'}</Text>
          <Text style={styles.profileEmail}>{userProfile?.email || user?.email || ''}</Text>
        </View>

        {/* Settings Options */}
        <View style={styles.optionsContainer}>
          {/* Edit Profile */}
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setShowEditProfileModal(true)}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="person-outline" size={24} color="#6366F1" />
              </View>
              <Text style={styles.optionText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* History */}
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => router.push('/history')}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: '#EEF2FF' }]}>
                <FontAwesome name="history" size={24} color="#6366F1" />
              </View>
              <Text style={styles.optionText}>History</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>          

          {/* Change Password */}
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setShowChangePasswordModal(true)}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="lock-closed-outline" size={24} color="#22C55E" />
              </View>
              <Text style={styles.optionText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={styles.optionItem}
            onPress={handleLogout}
            disabled={isSigningOut}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="log-out-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.optionText}>
                {isSigningOut ? 'Logging out...' : 'Logout'}
                    </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={[styles.optionItem, styles.deleteOption]}
            onPress={() => setShowDeleteAccountModal(true)}
            disabled={isDeletingAccount}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </View>
              <Text style={[styles.optionText, styles.deleteText]}>
                {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        name={editName}
        email={editEmail}
        photoURL={editPhotoURL}
        // pass date + change handler
        onNameChange={setEditName}
        onPhotoURLChange={setEditPhotoURL}
        onSave={handleUpdateProfile}
        isSaving={updateUserMutation.isPending}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => {
          setShowChangePasswordModal(false)
          setCurrentPassword('')
          setNewPassword('')
          setConfirmNewPassword('')
        }}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmNewPassword={confirmNewPassword}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmNewPasswordChange={setConfirmNewPassword}
        onSave={handleChangePassword}
        isSaving={isUpdatingPassword || isReauthenticating}
      />

      {/* Delete Account Modal (moved to component) */}
      <DeleteAccountModal
        visible={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onDelete={handleDeleteAccount}
        isDeleting={isDeletingAccount}
        isReauthenticating={isReauthenticating}
        styles={styles}
      />
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    // paddingVertical: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  deleteOption: {
    marginTop: 8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  deleteText: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  deleteTitle: {
    color: '#EF4444',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
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
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginTop: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#374151',
  },
})