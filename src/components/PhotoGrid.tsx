import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { PhotoSlot } from '../services/StorageService';

interface PhotoGridProps {
  photos: PhotoSlot[];
  onPhotoPress: (index: number) => void;
  onAddPhotoPress: (index: number) => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoPress,
  onAddPhotoPress,
}) => {
  const resolveImageSource = (uri: string) => {
    if (uri === 'bundle:my_dog') {
      return require('../../assets/my_dog.jpg');
    }

    return { uri };
  };

  const renderSlot = (slot: PhotoSlot, index: number) => {
    const isEmpty = !slot?.uri;
    const title = !isEmpty ? (slot.name?.trim() ? slot.name : `Photo ${index + 1}`) : 'Add Photo';

    return (
      <TouchableOpacity
        key={`photo-slot-${index}`}
        style={[styles.cardContainer, isEmpty && styles.addCardContainer]}
        onPress={() => (isEmpty ? onAddPhotoPress(index) : onPhotoPress(index))}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardCount}>{isEmpty ? 'Tap to add' : '1 photo'}</Text>
        <View style={styles.cardThumbnail}>
          {slot.uri ? (
            <Image source={resolveImageSource(slot.uri)} style={styles.thumbnailImage} resizeMode="contain" />
          ) : (
            <Text style={styles.addCardIcon}>+</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGrid = () => {
    const gridItems = [];

    for (let i = 0; i < 4; i++) {
      gridItems.push(renderSlot(photos[i] ?? { uri: null, name: null }, i));
    }

    return gridItems;
  };

  return <View style={styles.grid}>{renderGrid()}</View>;
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
  },
  cardContainer: {
    width: cardWidth,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addCardContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  cardCount: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 12,
  },
  cardThumbnail: {
    height: 80,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  addCardIcon: {
    fontSize: 32,
    color: '#007aff',
    fontWeight: '300',
  },
});
