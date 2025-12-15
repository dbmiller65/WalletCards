import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';

interface AddPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  onSavePhoto: (photo: { name: string; uri: string }) => void;
}

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({
  visible,
  onClose,
  onSavePhoto,
}) => {
  const [photoName, setPhotoName] = useState('');
  const [photoUri, setPhotoUri] = useState('');

  useEffect(() => {
    if (!visible) return;
    setPhotoName('');
    setPhotoUri('');
  }, [visible]);

  const handleClose = () => {
    setPhotoName('');
    setPhotoUri('');
    onClose();
  };

  const selectImage = () => {
    Alert.alert('Select Photo', 'Choose how you want to add the photo', [
      { text: 'Camera', onPress: () => openCamera() },
      { text: 'Photo Library', onPress: () => openImageLibrary() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const imageUri = `data:image/jpeg;base64,${response.assets[0].base64}`;
          setPhotoUri(imageUri);
        }
      }
    );
  };

  const openImageLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const imageUri = `data:image/jpeg;base64,${response.assets[0].base64}`;
          setPhotoUri(imageUri);
        }
      }
    );
  };

  const handleSave = () => {
    if (!photoUri) {
      Alert.alert('Error', 'Please add a photo');
      return;
    }

    const name = photoName.trim();

    onClose();

    onSavePhoto({
      name,
      uri: photoUri,
    });

    setPhotoName('');
    setPhotoUri('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Photo</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Photo Name:</Text>
            <TextInput
              style={styles.input}
              value={photoName}
              onChangeText={setPhotoName}
              placeholder="e.g., Passport, Medical Card, Receipts"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.uploadGroup}>
            <Text style={styles.label}>Photo:</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
              <Text style={styles.uploadButtonText}>
                {photoUri ? 'Change Photo' : 'Take/Select Photo'}
              </Text>
            </TouchableOpacity>
            {photoUri ? (
              <View style={styles.preview}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#d2d2d7',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#8e8e93',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  uploadGroup: {
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f2f2f7',
  },
  previewImage: {
    width: '100%',
    height: 220,
  },
  actions: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8e8e93',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#34c759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
