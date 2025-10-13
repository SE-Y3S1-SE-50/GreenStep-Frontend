import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_completed';

export const onboardingUtils = {
  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      console.log('🔍 onboardingUtils.hasCompletedOnboarding - Raw value:', value);
      console.log('🔍 onboardingUtils.hasCompletedOnboarding - Result:', value === 'true');
      return value === 'true';
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
      return false;
    }
  },

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      console.log('✅ Onboarding marked as completed');
      
      // Verify it was saved
      const saved = await AsyncStorage.getItem(ONBOARDING_KEY);
      console.log('🔍 Verification - Saved value:', saved);
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      throw error;
    }
  },

  /**
   * Reset onboarding (useful for testing)
   */
  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      console.log('🔄 Onboarding reset successfully');
      
      // Verify it was removed
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      console.log('🔍 Verification - Value after reset:', value);
    } catch (error) {
      console.error('❌ Error resetting onboarding:', error);
      throw error;
    }
  },

  /**
   * Debug: Show current onboarding status
   */
  async debugStatus(): Promise<void> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      console.log('🐛 DEBUG - Onboarding status:');
      console.log('  - Raw value:', value);
      console.log('  - Type:', typeof value);
      console.log('  - Is completed:', value === 'true');
      
      // Get all keys to see what's stored
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('  - All AsyncStorage keys:', allKeys);
    } catch (error) {
      console.error('❌ Error debugging onboarding status:', error);
    }
  }
};