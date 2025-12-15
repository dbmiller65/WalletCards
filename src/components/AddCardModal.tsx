import React, { useState } from 'react';
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

interface AddCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveCard: (card: {
    name: string;
    frontImage: string;
    backImage: string;
    type: string;
  }) => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  visible,
  onClose,
  onSaveCard,
}) => {
  const [cardName, setCardName] = useState('');
  const [frontImage, setFrontImage] = useState('');
  const [backImage, setBackImage] = useState('');

  const resetForm = () => {
    setCardName('');
    setFrontImage('');
    setBackImage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectImage = (side: 'front' | 'back') => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add the image',
      [
        { text: 'Camera', onPress: () => openCamera(side) },
        { text: 'Photo Library', onPress: () => openImageLibrary(side) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = (side: 'front' | 'back') => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const imageUri = `data:image/jpeg;base64,${response.assets[0].base64}`;
          if (side === 'front') {
            setFrontImage(imageUri);
          } else {
            setBackImage(imageUri);
          }
        }
      }
    );
  };

  const openImageLibrary = (side: 'front' | 'back') => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const imageUri = `data:image/jpeg;base64,${response.assets[0].base64}`;
          if (side === 'front') {
            setFrontImage(imageUri);
          } else {
            setBackImage(imageUri);
          }
        }
      }
    );
  };

  const handleSave = () => {
    if (!cardName.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }
    if (!frontImage) {
      Alert.alert('Error', 'Please add a front image');
      return;
    }
    if (!backImage) {
      Alert.alert('Error', 'Please add a back image');
      return;
    }

    // Close modal first to prevent hook count issues
    onClose();
    
    // Then save the card
    onSaveCard({
      name: cardName.trim(),
      frontImage,
      backImage,
      type: 'custom',
    });

    resetForm();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Card</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Card Name:</Text>
            <TextInput
              style={styles.input}
              value={cardName}
              onChangeText={setCardName}
              placeholder="e.g., Driver License, Credit Card, etc."
              autoCapitalize="words"
            />
          </View>

          <View style={styles.uploadSection}>
            <View style={styles.uploadGroup}>
              <Text style={styles.label}>Front Photo:</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => selectImage('front')}
              >
                <Text style={styles.uploadButtonText}>
                  {frontImage ? 'Change Photo' : 'Take/Select Photo'}
                </Text>
              </TouchableOpacity>
              {frontImage && (
                <View style={styles.preview}>
                  <Image source={{ uri: frontImage }} style={styles.previewImage} />
                </View>
              )}
            </View>

            <View style={styles.uploadGroup}>
              <Text style={styles.label}>Back Photo:</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => selectImage('back')}
              >
                <Text style={styles.uploadButtonText}>
                  {backImage ? 'Change Photo' : 'Take/Select Photo'}
                </Text>
              </TouchableOpacity>
              {backImage && (
                <View style={styles.preview}>
                  <Image source={{ uri: backImage }} style={styles.previewImage} />
                </View>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save Card</Text>
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
    backgroundColor: '#ffffff',
  },
  uploadSection: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  uploadGroup: {
    flex: 1,
  },
  uploadButton: {
    backgroundColor: '#007aff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  preview: {
    height: 120,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8e8e93',
    padding: 16,
    borderRadius: 8,
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
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
