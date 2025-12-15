import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Alert } from 'react-native';

export class BiometricService {
  private static rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

  static async isBiometricSupported(): Promise<boolean> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      return available && (biometryType === BiometryTypes.TouchID || biometryType === BiometryTypes.FaceID);
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return false;
    }
  }

  static async getBiometricType(): Promise<string | null> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      if (!available) return null;
      
      switch (biometryType) {
        case BiometryTypes.TouchID:
          return 'Touch ID';
        case BiometryTypes.FaceID:
          return 'Face ID';
        default:
          return 'Biometric';
      }
    } catch (error) {
      console.error('Error getting biometric type:', error);
      return null;
    }
  }

  static async authenticate(reason: string = 'Authenticate to access your wallet cards'): Promise<boolean> {
    try {
      const isSupported = await this.isBiometricSupported();
      if (!isSupported) {
        Alert.alert(
          'Biometric Authentication Unavailable',
          'Your device does not support biometric authentication or it is not set up.'
        );
        return false;
      }

      const { success, error } = await this.rnBiometrics.simplePrompt({
        promptMessage: reason,
        cancelButtonText: 'Cancel',
      });

      if (success) {
        return true;
      } else {
        console.log('Biometric authentication failed:', error);
        return false;
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert(
        'Authentication Error',
        'An error occurred during biometric authentication. Please try again.'
      );
      return false;
    }
  }

  static async createBiometricKey(keyTag: string): Promise<boolean> {
    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      if (!available) return false;

      const result = await this.rnBiometrics.createKeys();
      return result.publicKey ? true : false;
    } catch (error) {
      console.error('Error creating biometric key:', error);
      return false;
    }
  }

  static async deleteBiometricKey(): Promise<boolean> {
    try {
      const result = await this.rnBiometrics.deleteKeys();
      return result.keysDeleted || false;
    } catch (error) {
      console.error('Error deleting biometric key:', error);
      return false;
    }
  }
}
