import * as ImagePicker from 'expo-image-picker';

export const pickImageToBase64 = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsMultipleSelection: false,
    base64: true,
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].base64 || null;
  }
  return null;
};


export const base64ToImageUri = (base64Data: string) => { return `data:image/png;base64,${base64Data}`; };