import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import ImageZoom from 'react-native-image-zoom-viewer';
import { TrashIcon } from './TrashIcon';

interface PhotoDetailModalProps {
  visible: boolean;
  photoUri: string | null;
  photoName: string | null;
  index: number;
  onClose: () => void;
  onReplace: () => void;
  onDelete: () => void;
  onRename: (name: string | null) => void;
}

const { width } = Dimensions.get('window');

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  visible,
  photoUri,
  photoName,
  index,
  onClose,
  onReplace,
  onDelete,
  onRename,
}) => {
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    if (visible) {
      setShowImageZoom(false);
      if (!photoUri || photoUri === 'bundle:my_dog') {
        setImageLoading(false);
      } else {
        setImageLoading(true);
      }
      setIsEditingTitle(false);
      setEditedTitle(photoName ?? '');
    }
  }, [visible, photoName, photoUri]);

  const displayTitle = photoName?.trim() ? photoName : `Photo ${index + 1}`;

  const handleSaveTitle = () => {
    const trimmed = editedTitle.trim();
    onRename(trimmed ? trimmed : null);
    setIsEditingTitle(false);
  };

  const imageUrls = useMemo(() => {
    if (!photoUri) return [];
    if (photoUri === 'bundle:my_dog') return [];
    return [{ url: photoUri }];
  }, [photoUri]);

  const resolvedImageSource = useMemo(() => {
    if (!photoUri) return null;
    if (photoUri === 'bundle:my_dog') {
      return require('../../assets/my_dog.jpg');
    }

    return { uri: photoUri };
  }, [photoUri]);

  const handleDelete = () => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onClose();
          onDelete();
        },
      },
    ]);
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
                  placeholder={`Photo ${index + 1}`}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSaveTitle}
                />
              ) : (
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{displayTitle}</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setEditedTitle(photoName ?? '');
                      setIsEditingTitle(true);
                    }}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteButton}>
                <TrashIcon size={22} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => photoUri && photoUri !== 'bundle:my_dog' && setShowImageZoom(true)}
              disabled={!photoUri || photoUri === 'bundle:my_dog'}
            >
              {resolvedImageSource ? (
                <>
                  {imageLoading && (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                  )}
                  <Image
                    source={resolvedImageSource}
                    style={[styles.photoImage, imageLoading && styles.hiddenImage]}
                    resizeMode="contain"
                    onLoadStart={() => {
                      if (photoUri && photoUri !== 'bundle:my_dog') setImageLoading(true);
                    }}
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                    onLoadEnd={() => setImageLoading(false)}
                  />
                </>
              ) : (
                <View style={[styles.photoImage, styles.emptyImageSlot]}>
                  <Text style={styles.emptyImageText}>No Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={onReplace}>
                <Text style={styles.primaryText}>Replace</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showImageZoom} transparent>
        <ImageZoom
          imageUrls={imageUrls}
          onCancel={() => setShowImageZoom(false)}
          enableSwipeDown
          renderHeader={() => (
            <TouchableOpacity style={styles.zoomCloseButton} onPress={() => setShowImageZoom(false)}>
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
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editButton: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
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
  imageContainer: {
    width: '100%',
    height: width,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  emptyImageSlot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImageText: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deleteText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
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
  },
  loadingText: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },
  hiddenImage: {
    opacity: 0,
  },
  zoomCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  zoomCloseText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
