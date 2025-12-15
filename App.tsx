/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';

import { CardGrid } from './src/components/CardGrid';
import { CardDetailModal } from './src/components/CardDetailModal';
import { AddCardModal } from './src/components/AddCardModal';
import { AddPhotoModal } from './src/components/AddPhotoModal';
import { PhotoGrid } from './src/components/PhotoGrid';
import { PhotoDetailModal } from './src/components/PhotoDetailModal';
// import { BiometricLockScreen } from './src/components/BiometricLockScreen';
import { BiometricSettings } from './src/components/BiometricSettings';
import { BiometricProvider, useBiometric } from './src/contexts/BiometricContext';
import { StorageService, Card, PhotoSlot } from './src/services/StorageService';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cards' | 'photos'>('cards');
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { uri: null, name: null },
    { uri: null, name: null },
    { uri: null, name: null },
    { uri: null, name: null },
  ]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [showPhotoDetailModal, setShowPhotoDetailModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [addPhotoSlotIndex, setAddPhotoSlotIndex] = useState<number>(0);

  useEffect(() => {
    loadCards();
    loadPhotos();
  }, []);

  const loadCards = async () => {
    const loadedCards = await StorageService.getCards();
    setCards(loadedCards);
  };

  const loadPhotos = async () => {
    const loadedPhotos = await StorageService.getPhotos();
    setPhotos(loadedPhotos);
  };

  const handleCardPress = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      setSelectedCard(card);
      setShowDetailModal(true);
    }
  };

  const handleAddCard = async (cardData: {
    name: string;
    frontImage: string;
    backImage: string;
    type: string;
  }) => {
    const newCard = await StorageService.addCard(cardData);
    setCards(prev => [...prev, newCard]);
  };

  const handleUpdateCard = async (updatedCard: Card) => {
    await StorageService.updateCard(updatedCard);
    setCards(prev => prev.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    ));
    // Update selectedCard if it's the same card being updated
    if (selectedCard && selectedCard.id === updatedCard.id) {
      setSelectedCard(updatedCard);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    await StorageService.deleteCard(cardId);
    setCards(prev => prev.filter(card => card.id !== cardId));
    // Close modal if the deleted card was being viewed
    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard(null);
    }
  };

  const handleUploadPhoto = (side: 'front' | 'back') => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      },
      (response) => {
        if (response.assets && response.assets[0] && selectedCard) {
          const imageUri = `data:image/jpeg;base64,${response.assets[0].base64}`;
          const updatedCard = {
            ...selectedCard,
            [side === 'front' ? 'frontImage' : 'backImage']: imageUri,
          };
          handleUpdateCard(updatedCard);
          setSelectedCard(updatedCard);
        }
      }
    );
  };

  const handleReplacePhotoAtIndex = (index: number) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      },
      async (response) => {
        if (response.assets && response.assets[0]) {
          const imageUri = `data:image/jpeg;base64,${response.assets[0].base64}`;
          const next = await StorageService.setPhotoAtIndex(index, imageUri);
          setPhotos(next);
        }
      }
    );
  };

  const handleAddPhotoPress = (index: number) => {
    setAddPhotoSlotIndex(index);
    setShowAddPhotoModal(true);
  };

  const handleSaveNewPhotoToSlot = async (photo: { name: string; uri: string }) => {
    const name = photo.name.trim();
    const next = await StorageService.setPhotoSlotAtIndex(addPhotoSlotIndex, {
      uri: photo.uri,
      name: name ? name : null,
    });
    setPhotos(next);
  };

  const handleOpenPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoDetailModal(true);
  };

  const handleDeletePhotoAtIndex = async (index: number) => {
    const next = await StorageService.deletePhotoAtIndex(index);
    setPhotos(next);
  };

  const handleRenamePhotoAtIndex = async (index: number, name: string | null) => {
    const next = await StorageService.setPhotoNameAtIndex(index, name);
    setPhotos(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f7" />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{activeTab === 'cards' ? 'Wallet Cards' : 'Photos'}</Text>
          <Text style={styles.subtitle}>
            {activeTab === 'cards' ? 'Your digital wallet' : 'Show off your important photos'}
          </Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettingsModal(true)}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'cards' && styles.tabButtonActive]}
          onPress={() => setActiveTab('cards')}
        >
          <Text style={[styles.tabText, activeTab === 'cards' && styles.tabTextActive]}>Cards</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'photos' && styles.tabButtonActive]}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>Photos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'cards' ? (
          <>
            <CardGrid
              cards={cards}
              onCardPress={handleCardPress}
              onAddCardPress={() => setShowAddModal(true)}
            />

            <CardDetailModal
              visible={showDetailModal}
              card={selectedCard}
              onClose={() => setShowDetailModal(false)}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onUploadPhoto={handleUploadPhoto}
            />

            <AddCardModal
              visible={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSaveCard={handleAddCard}
            />
          </>
        ) : (
          <>
            <PhotoGrid
              photos={photos}
              onPhotoPress={handleOpenPhoto}
              onAddPhotoPress={handleAddPhotoPress}
            />

            <AddPhotoModal
              visible={showAddPhotoModal}
              onClose={() => setShowAddPhotoModal(false)}
              onSavePhoto={handleSaveNewPhotoToSlot}
            />

            <PhotoDetailModal
              visible={showPhotoDetailModal}
              photoUri={photos[selectedPhotoIndex]?.uri ?? null}
              photoName={photos[selectedPhotoIndex]?.name ?? null}
              index={selectedPhotoIndex}
              onClose={() => setShowPhotoDetailModal(false)}
              onReplace={() => handleReplacePhotoAtIndex(selectedPhotoIndex)}
              onDelete={() => handleDeletePhotoAtIndex(selectedPhotoIndex)}
              onRename={(name) => handleRenamePhotoAtIndex(selectedPhotoIndex, name)}
            />
          </>
        )}
      </View>

      <BiometricSettings
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return (
    <BiometricProvider>
      <AppContent />
    </BiometricProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsIcon: {
    fontSize: 20,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 4,
    backgroundColor: '#e9e9ee',
    borderRadius: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
  },
  tabTextActive: {
    color: '#1d1d1f',
  },
});

export default App;
