import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useBiometric } from '../contexts/BiometricContext';

interface BiometricSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export const BiometricSettings: React.FC<BiometricSettingsProps> = ({
  visible,
  onClose,
}) => {
  const {
    isBiometricEnabled,
    biometricType,
    enableBiometric,
    disableBiometric,
  } = useBiometric();

  if (!visible) return null;

  const handleToggleBiometric = async (enabled: boolean) => {
    if (enabled) {
      const success = await enableBiometric();
      if (!success) {
        Alert.alert(
          'Failed to Enable',
          `Could not enable ${biometricType || 'biometric'} authentication. Please check your device settings.`
        );
      }
    } else {
      const success = await disableBiometric();
      if (success) {
        Alert.alert(
          'Biometric Disabled',
          'Biometric authentication has been disabled. Your cards will be accessible without authentication.'
        );
      }
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Security Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                {biometricType || 'Biometric'} Authentication
              </Text>
              <Text style={styles.settingDescription}>
                {biometricType
                  ? `Use ${biometricType} to unlock your wallet cards`
                  : 'Biometric authentication is not available on this device'}
              </Text>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={handleToggleBiometric}
              disabled={!biometricType}
              trackColor={{ false: '#d2d2d7', true: '#007aff' }}
              thumbColor={isBiometricEnabled ? '#ffffff' : '#ffffff'}
            />
          </View>

          {!biometricType && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Biometric authentication is not available. Please set up Face ID or Touch ID in your device settings.
              </Text>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>About Security</Text>
            <Text style={styles.infoText}>
              When enabled, you'll need to authenticate with {biometricType || 'biometrics'} each time you open the app. This helps protect your sensitive card information.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#8e8e93',
  },
  content: {
    padding: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});
