import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import ImageZoom from 'react-native-image-zoom-viewer';

import { Card } from '../services/StorageService';
import { TrashIcon } from './TrashIcon';

interface CardDetailModalProps {
  visible: boolean;
  card: Card | null;
  onClose: () => void;
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onUploadPhoto: (side: 'front' | 'back') => void;
}

const { width, height } = Dimensions.get('window');

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  visible,
  card,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onUploadPhoto,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomImage, setZoomImage] = useState('');
  const [frontImageLoading, setFrontImageLoading] = useState(false);
  const [backImageLoading, setBackImageLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (!card) return;

    if (!card.frontImage) {
      setFrontImageLoading(false);
    } else if (typeof card.frontImage === 'string') {
      setFrontImageLoading(true);
    } else {
      setFrontImageLoading(false);
    }

    if (!card.backImage) {
      setBackImageLoading(false);
    } else if (typeof card.backImage === 'string') {
      setBackImageLoading(true);
    } else {
      setBackImageLoading(false);
    }
  }, [visible, card?.frontImage, card?.backImage]);

  if (!card) return null;

  const handleTitleEdit = () => {
    setEditedTitle(card.name);
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (editedTitle.trim()) {
      onUpdateCard({ ...card, name: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleImagePress = (imageUri: string) => {
    setZoomImage(imageUri);
    setShowImageZoom(true);
  };

  const handleDeleteCard = () => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this entire card? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onClose(); // Close modal first
            onDeleteCard(card.id); // Then delete the card
          },
        },
      ]
    );
  };

  const handleDeleteImage = (side: 'front' | 'back') => {
    Alert.alert(
      'Delete Image',
      `Are you sure you want to delete the ${side} image?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Reset loading state and clear image immediately
            if (side === 'front') {
              setFrontImageLoading(false);
            } else {
              setBackImageLoading(false);
            }
            
            const updatedCard = {
              ...card,
              [side === 'front' ? 'frontImage' : 'backImage']: null,
            };
            onUpdateCard(updatedCard);
          },
        },
      ]
    );
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {isEditingTitle ? (
                <TextInput
                  style={styles.titleInput}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  onBlur={handleTitleSave}
                  onSubmitEditing={handleTitleSave}
                  autoFocus
                />
              ) : (
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{card.name}</Text>
                  <TouchableOpacity onPress={handleTitleEdit} style={styles.editButton}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleDeleteCard} style={styles.headerDeleteButton}>
                <TrashIcon size={22} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View style={styles.content}>
              <View style={styles.imagesContainer}>
                <View style={styles.imageSection}>
                  <Text style={styles.imageLabel}>Front</Text>
                  <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={() => card.frontImage && handleImagePress(card.frontImage)}
                  >
                    {card.frontImage ? (
                      <>
                        {frontImageLoading && (
                          <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading...</Text>
                          </View>
                        )}
                        <Image 
                          source={typeof card.frontImage === 'string' ? { uri: card.frontImage } : card.frontImage} 
                          style={[styles.cardImage, frontImageLoading && styles.hiddenImage]} 
                          onLoadStart={() => {
                            if (typeof card.frontImage === 'string') setFrontImageLoading(true);
                          }}
                          onLoad={() => setFrontImageLoading(false)}
                          onError={() => setFrontImageLoading(false)}
                          onLoadEnd={() => setFrontImageLoading(false)}
                        />
                      </>
                    ) : (
                      <View style={[styles.cardImage, styles.emptyImageSlot]}>
                        <Text style={styles.emptyImageText}>No Image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => onUploadPhoto('front')}
                    >
                      <Text style={styles.uploadText}>Take/Upload</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteImage('front')}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.imageSection}>
                  <Text style={styles.imageLabel}>Back</Text>
                  <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={() => card.backImage && handleImagePress(card.backImage)}
                  >
                    {card.backImage ? (
                      <>
                        {backImageLoading && (
                          <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading...</Text>
                          </View>
                        )}
                        <Image 
                          source={typeof card.backImage === 'string' ? { uri: card.backImage } : card.backImage} 
                          style={[styles.cardImage, backImageLoading && styles.hiddenImage]} 
                          onLoadStart={() => {
                            if (typeof card.backImage === 'string') setBackImageLoading(true);
                          }}
                          onLoad={() => setBackImageLoading(false)}
                          onError={() => setBackImageLoading(false)}
                          onLoadEnd={() => setBackImageLoading(false)}
                        />
                      </>
                    ) : (
                      <View style={[styles.cardImage, styles.emptyImageSlot]}>
                        <Text style={styles.emptyImageText}>No Image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => onUploadPhoto('back')}
                    >
                      <Text style={styles.uploadText}>Take/Upload</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteImage('back')}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showImageZoom} transparent>
        <ImageZoom
          imageUrls={[{ url: zoomImage }]}
          onCancel={() => setShowImageZoom(false)}
          enableSwipeDown
          renderHeader={() => (
            <TouchableOpacity
              style={styles.zoomCloseButton}
              onPress={() => setShowImageZoom(false)}
            >
              <Text style={styles.zoomCloseText}>✕</Text>
            </TouchableOpacity>
          )}
        />
      </Modal>
    </>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerDeleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1d1d1f',
    borderWidth: 1,
    borderColor: '#007aff',
    borderRadius: 4,
    padding: 4,
  },
  editButton: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editText: {
    fontSize: 14,
    color: '#007aff',
    textDecorationLine: 'underline',
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
  scrollContent: {
    paddingBottom: 40,
  },
  imagesContainer: {
    flexDirection: 'column',
    gap: 24,
    marginBottom: 32,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
    textAlign: 'center',
  },
  imageContainer: {
    aspectRatio: 1.6,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#007aff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  deleteCardButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  deleteCardText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  zoomCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomCloseText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },
  hiddenImage: {
    opacity: 0,
  },
  emptyImageSlot: {
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#d0d0d0',
  },
  emptyImageText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '500',
  },
});
