import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';

import { Card } from '../services/StorageService';

interface CardGridProps {
  cards: Card[];
  onCardPress: (cardId: string) => void;
  onAddCardPress: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onCardPress,
  onAddCardPress,
}) => {

  const renderCard = (card: Card, index: number) => {
    return (
      <TouchableOpacity
        key={`${card.id}-${index}`}
        style={styles.cardContainer}
        onPress={() => onCardPress(card.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{card.name}</Text>
        </View>
        <Text style={styles.cardCount}>1 card</Text>
        <View style={styles.cardThumbnail}>
          {card.frontImage ? (
            <Image 
              source={typeof card.frontImage === 'string' ? { uri: card.frontImage } : card.frontImage} 
              style={styles.thumbnailImage}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.thumbnailImage, styles.emptyThumbnail]}>
              <Text style={styles.emptyThumbnailText}>No Image</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddCard = () => (
    <TouchableOpacity
      key="add-card"
      style={[styles.cardContainer, styles.addCardContainer]}
      onPress={onAddCardPress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Add New Card</Text>
      </View>
      <Text style={styles.cardCount}>Tap to add</Text>
      <View style={styles.cardThumbnail}>
        <Text style={styles.addCardIcon}>+</Text>
      </View>
    </TouchableOpacity>
  );

  const renderGrid = () => {
    const gridItems = [];
    
    // Always render exactly 4 slots
    for (let i = 0; i < 4; i++) {
      if (i < cards.length) {
        // Render existing card
        gridItems.push(renderCard(cards[i], i));
      } else {
        // Render "Add New Card" placeholder
        gridItems.push(
          <View key={`add-card-${i}`}>{renderAddCard()}</View>
        );
      }
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
  debugOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugText: {
    color: 'white',
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
  emptyThumbnail: {
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  emptyThumbnailText: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
  },
});
