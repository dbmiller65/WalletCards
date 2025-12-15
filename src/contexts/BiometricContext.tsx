import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BiometricService } from '../services/BiometricService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricContextType {
  isAuthenticated: boolean;
  isBiometricEnabled: boolean;
  biometricType: string | null;
  authenticate: () => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  logout: () => void;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

interface BiometricProviderProps {
  children: ReactNode;
}

export const BiometricProvider: React.FC<BiometricProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      // Check if biometric is supported
      const supported = await BiometricService.isBiometricSupported();
      if (supported) {
        const type = await BiometricService.getBiometricType();
        setBiometricType(type);
      }

      // Check if biometric is enabled in settings
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      setIsBiometricEnabled(enabled === 'true');

      // Check if user was previously authenticated (for app resume)
      const wasAuthenticated = await AsyncStorage.getItem('was_authenticated');
      if (wasAuthenticated === 'true') {
        // Reset authentication state on app start for security
        await AsyncStorage.removeItem('was_authenticated');
      }
    } catch (error) {
      console.error('Error initializing biometric:', error);
    }
  };

  const authenticate = async (): Promise<boolean> => {
    try {
      if (!isBiometricEnabled) {
        setIsAuthenticated(true);
        return true;
      }

      const success = await BiometricService.authenticate('Unlock your wallet cards');
      if (success) {
        setIsAuthenticated(true);
        await AsyncStorage.setItem('was_authenticated', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const enableBiometric = async (): Promise<boolean> => {
    try {
      const supported = await BiometricService.isBiometricSupported();
      if (!supported) {
        return false;
      }

      const success = await BiometricService.authenticate('Enable biometric authentication');
      if (success) {
        await AsyncStorage.setItem('biometric_enabled', 'true');
        setIsBiometricEnabled(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  };

  const disableBiometric = async (): Promise<boolean> => {
    try {
      await AsyncStorage.setItem('biometric_enabled', 'false');
      setIsBiometricEnabled(false);
      return true;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    AsyncStorage.removeItem('was_authenticated');
  };

  return (
    <BiometricContext.Provider
      value={{
        isAuthenticated,
        isBiometricEnabled,
        biometricType,
        authenticate,
        enableBiometric,
        disableBiometric,
        logout,
      }}
    >
      {children}
    </BiometricContext.Provider>
  );
};

export const useBiometric = (): BiometricContextType => {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometric must be used within a BiometricProvider');
  }
  return context;
};
