import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Card {
  id: string;
  name: string;
  frontImage: string | null;
  backImage: string | null;
  type: string;
  createdAt: string;
}

const STORAGE_KEY = 'walletCards';
const FIRST_LAUNCH_KEY = 'firstLaunch';
const PHOTOS_STORAGE_KEY = 'walletPhotos';
const STORAGE_SCHEMA_VERSION_KEY = 'walletStorageSchemaVersion';
const STORAGE_SCHEMA_VERSION = '5';
const PHOTO_SAMPLE_SEEDED_KEY = 'walletPhotoSampleSeeded';
const PHOTO_SLOTS_COUNT = 4;

export type PhotoSlot = {
  uri: string | null;
  name: string | null;
};

export class StorageService {
  private static async ensureStorageSchema(): Promise<void> {
    try {
      const current = await AsyncStorage.getItem(STORAGE_SCHEMA_VERSION_KEY);
      if (current === STORAGE_SCHEMA_VERSION) return;

      await AsyncStorage.multiRemove([
        STORAGE_KEY,
        PHOTOS_STORAGE_KEY,
        FIRST_LAUNCH_KEY,
        PHOTO_SAMPLE_SEEDED_KEY,
      ]);
      await AsyncStorage.setItem(STORAGE_SCHEMA_VERSION_KEY, STORAGE_SCHEMA_VERSION);
    } catch (error) {
      console.error('Error ensuring storage schema:', error);
    }
  }

  private static async seedPhotoSampleIfNeeded(photos: PhotoSlot[]): Promise<PhotoSlot[]> {
    const alreadySeeded = await AsyncStorage.getItem(PHOTO_SAMPLE_SEEDED_KEY);
    if (alreadySeeded === '1') return photos;

    const hasAnyPhoto = photos.some(p => Boolean(p?.uri));
    if (hasAnyPhoto) {
      await AsyncStorage.setItem(PHOTO_SAMPLE_SEEDED_KEY, '1');
      return photos;
    }

    const seeded: PhotoSlot[] = [
      { uri: 'bundle:my_dog', name: 'My Dog' },
      { uri: null, name: null },
      { uri: null, name: null },
      { uri: null, name: null },
    ];
    await StorageService.savePhotos(seeded);
    await AsyncStorage.setItem(PHOTO_SAMPLE_SEEDED_KEY, '1');
    return seeded;
  }

  static async getCards(): Promise<Card[]> {
    try {
      await StorageService.ensureStorageSchema();
      const cardsJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (cardsJson) {
        const parsed = JSON.parse(cardsJson);
        if (Array.isArray(parsed)) {
          return StorageService.attachSampleImages(parsed as Card[]);
        }
      }

      // Return sample cards if no cards exist and save them
      const sampleCards = StorageService.createSampleCards();
      await StorageService.saveCards(sampleCards);
      return sampleCards;
    } catch (error) {
      console.error('Error loading cards:', error);
      const sampleCards = StorageService.createSampleCards();
      await StorageService.saveCards(sampleCards);
      return sampleCards;
    }
  }

  static async saveCards(cards: Card[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(StorageService.stripNonSerializableCardImages(cards))
      );
    } catch (error) {
      console.error('Error saving cards:', error);
    }
  }

  static async addCard(card: Omit<Card, 'id' | 'createdAt'>): Promise<Card> {
    const newCard: Card = {
      ...card,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const cards = await StorageService.getCards();
    cards.push(newCard);
    await StorageService.saveCards(cards);

    return newCard;
  }

  static async updateCard(updatedCard: Card): Promise<void> {
    const cards = await StorageService.getCards();
    const index = cards.findIndex(card => card.id === updatedCard.id);

    if (index !== -1) {
      cards[index] = updatedCard;
      await StorageService.saveCards(cards);
    }
  }

  static async deleteCard(cardId: string): Promise<void> {
    const cards = await StorageService.getCards();
    const filteredCards = cards.filter(card => card.id !== cardId);
    await StorageService.saveCards(filteredCards);
  }

  static async getPhotos(): Promise<PhotoSlot[]> {
    try {
      await StorageService.ensureStorageSchema();
      const photosJson = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
      if (photosJson) {
        const parsed = JSON.parse(photosJson);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .slice(0, PHOTO_SLOTS_COUNT)
            .map((item, index) => {
              if (typeof item === 'string' || item === null) {
                return { uri: item, name: null };
              }

              if (item && typeof item === 'object') {
                const uri = typeof (item as any).uri === 'string' || (item as any).uri === null ? (item as any).uri : null;
                const name = typeof (item as any).name === 'string' || (item as any).name === null ? (item as any).name : null;
                return { uri, name };
              }

              return { uri: null, name: null };
            });

          while (normalized.length < PHOTO_SLOTS_COUNT) {
            normalized.push({ uri: null, name: null });
          }

          return await StorageService.seedPhotoSampleIfNeeded(normalized);
        }
      }

      const empty = Array.from({ length: PHOTO_SLOTS_COUNT }, () => ({ uri: null, name: null } as PhotoSlot));
      await StorageService.savePhotos(empty);
      return await StorageService.seedPhotoSampleIfNeeded(empty);
    } catch (error) {
      console.error('Error loading photos:', error);
      const empty = Array.from({ length: PHOTO_SLOTS_COUNT }, () => ({ uri: null, name: null } as PhotoSlot));
      await StorageService.savePhotos(empty);
      return empty;
    }
  }

  static async savePhotos(photos: PhotoSlot[]): Promise<void> {
    try {
      const normalized = photos
        .slice(0, PHOTO_SLOTS_COUNT)
        .map(item => ({
          uri: typeof item?.uri === 'string' || item?.uri === null ? item.uri : null,
          name: typeof item?.name === 'string' || item?.name === null ? item.name : null,
        }));
      while (normalized.length < PHOTO_SLOTS_COUNT) {
        normalized.push({ uri: null, name: null });
      }
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      console.error('Error saving photos:', error);
    }
  }

  static async setPhotoAtIndex(index: number, photoUri: string): Promise<PhotoSlot[]> {
    const photos = await StorageService.getPhotos();
    const existing = photos[index];
    return StorageService.setPhotoSlotAtIndex(index, {
      uri: photoUri,
      name: existing?.name ?? null,
    });
  }

  static async deletePhotoAtIndex(index: number): Promise<PhotoSlot[]> {
    const photos = await StorageService.getPhotos();
    const next = [...photos];
    if (index >= 0 && index < PHOTO_SLOTS_COUNT) {
      next[index] = {
        uri: null,
        name: null,
      };
      const compacted = StorageService.compactPhotoSlots(next);
      await StorageService.savePhotos(compacted);
      return compacted;
    }
    return next;
  }

  static async setPhotoNameAtIndex(index: number, name: string | null): Promise<PhotoSlot[]> {
    const photos = await StorageService.getPhotos();
    const existing = photos[index];
    return StorageService.setPhotoSlotAtIndex(index, {
      uri: existing?.uri ?? null,
      name,
    });
  }

  static async setPhotoSlotAtIndex(index: number, slot: PhotoSlot): Promise<PhotoSlot[]> {
    const photos = await StorageService.getPhotos();
    const next = [...photos];
    if (index >= 0 && index < PHOTO_SLOTS_COUNT) {
      next[index] = {
        uri: slot.uri,
        name: slot.name,
      };
      await StorageService.savePhotos(next);
    }
    return next;
  }

  private static compactPhotoSlots(photos: PhotoSlot[]): PhotoSlot[] {
    const normalized = photos
      .slice(0, PHOTO_SLOTS_COUNT)
      .map(slot => ({
        uri: typeof slot?.uri === 'string' || slot?.uri === null ? slot.uri : null,
        name: typeof slot?.name === 'string' || slot?.name === null ? slot.name : null,
      }));

    while (normalized.length < PHOTO_SLOTS_COUNT) {
      normalized.push({ uri: null, name: null });
    }

    const filled = normalized.filter(s => Boolean(s.uri));
    const emptyCount = PHOTO_SLOTS_COUNT - filled.length;
    const empties = Array.from({ length: Math.max(0, emptyCount) }, () => ({ uri: null, name: null } as PhotoSlot));
    return [...filled, ...empties].slice(0, PHOTO_SLOTS_COUNT);
  }

  private static createSampleCards(): Card[] {
    return [
      {
        id: 'sample-dl-1',
        type: 'driver-license',
        name: 'Driver License',
        frontImage: require('../../assets/lic_front.jpg'),
        backImage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-hi-1',
        type: 'health-insurance',
        name: 'Insurance',
        frontImage: require('../../assets/ins_front.jpg'),
        backImage: null,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  private static attachSampleImages(cards: Card[]): Card[] {
    return cards.map(card => {
      if (card.id === 'sample-dl-1' || card.type === 'driver-license') {
        return {
          ...card,
          frontImage: require('../../assets/lic_front.jpg'),
          backImage: null,
        };
      }

      if (card.id === 'sample-hi-1' || card.type === 'health-insurance') {
        return {
          ...card,
          frontImage: require('../../assets/ins_front.jpg'),
          backImage: null,
        };
      }

      return card;
    });
  }

  private static stripNonSerializableCardImages(cards: Card[]): Card[] {
    return cards.map(card => {
      const isSample =
        card.id === 'sample-dl-1' ||
        card.id === 'sample-hi-1' ||
        card.type === 'driver-license' ||
        card.type === 'health-insurance';

      if (isSample) {
        return {
          ...card,
          frontImage: null,
          backImage: null,
        };
      }

      return {
        ...card,
        frontImage: typeof card.frontImage === 'string' || card.frontImage === null ? card.frontImage : null,
        backImage: typeof card.backImage === 'string' || card.backImage === null ? card.backImage : null,
      };
    });
  }
}
