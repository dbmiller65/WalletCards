import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useBiometric } from '../contexts/BiometricContext';

const { width, height } = Dimensions.get('window');

interface BiometricLockScreenProps {
  onAuthenticated: () => void;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({
  onAuthenticated,
}) => {
  const { authenticate, biometricType, isBiometricEnabled } = useBiometric();

  useEffect(() => {
    // Auto-trigger authentication when screen loads
    if (isBiometricEnabled) {
      handleAuthenticate();
    } else {
      onAuthenticated();
    }
  }, []);

  const handleAuthenticate = async () => {
    const success = await authenticate();
    if (success) {
      onAuthenticated();
    }
  };

  const getBiometricIcon = () => {
    if (biometricType === 'Face ID') {
      return '🔓';
    } else if (biometricType === 'Touch ID') {
      return '👆';
    }
    return '🔒';
  };

  const getBiometricText = () => {
    if (biometricType === 'Face ID') {
      return 'Face ID';
    } else if (biometricType === 'Touch ID') {
      return 'Touch ID';
    }
    return 'Biometric';
  };

  if (!isBiometricEnabled) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getBiometricIcon()}</Text>
        </View>
        
        <Text style={styles.title}>Wallet Cards</Text>
        <Text style={styles.subtitle}>
          Use {getBiometricText()} to unlock your cards
        </Text>

        <TouchableOpacity
          style={styles.authenticateButton}
          onPress={handleAuthenticate}
        >
          <Text style={styles.authenticateButtonText}>
            Unlock with {getBiometricText()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            Alert.alert(
              'Skip Authentication',
              'Are you sure you want to skip biometric authentication? Your cards will be accessible without security.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Skip', onPress: onAuthenticated },
              ]
            );
          }}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  authenticateButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
  },
  authenticateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#007aff',
    fontSize: 16,
    textAlign: 'center',
  },
});
