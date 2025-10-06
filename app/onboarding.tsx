import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  iconColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Track Your Trees',
    description: 'Monitor the growth and health of your planted trees with detailed tracking and analytics.',
    icon: 'leaf',
    backgroundColor: '#dcfce7',
    iconColor: '#16a34a',
  },
  {
    id: '2',
    title: 'Care & Reminders',
    description: 'Never forget to water or fertilize. Get smart reminders for all your tree care activities.',
    icon: 'notifications',
    backgroundColor: '#dbeafe',
    iconColor: '#0ea5e9',
  },
  {
    id: '3',
    title: 'Environmental Impact',
    description: 'See your carbon absorption impact and contribute to a greener planet with every tree.',
    icon: 'earth',
    backgroundColor: '#fef3c7',
    iconColor: '#f59e0b',
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem('onboarding_completed', 'true');
      // Navigate to login
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: item.iconColor + '20' }]}>
          <Ionicons name={item.icon} size={120} color={item.iconColor} />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: currentIndex === index ? '#16a34a' : '#d1d5db',
              width: currentIndex === index ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
      />

      {/* Navigation */}
      <View style={styles.footer}>
        {renderDots()}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          {currentIndex === slides.length - 1 ? (
            <Text style={styles.nextButtonText}>Get Started</Text>
          ) : (
            <>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  slide: {
    width: width,
    height: height - 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 160,
  },
  iconCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: '#009900',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});