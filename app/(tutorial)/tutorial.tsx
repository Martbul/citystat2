import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as ScrollViewType,
} from 'react-native';

const { width, height } = Dimensions.get('window');

type TutorialItem = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  backgroundColor: string;
};

const TutorialScreen = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const scrollViewRef = useRef<ScrollViewType>(null);

  const tutorialData: TutorialItem[] = [
    {
      id: 1,
      title: "Welcome to MyApp",
      subtitle: "Your journey starts here",
      description: "Discover amazing features and connect with people around the world. Our app makes it easy to stay organized and productive.",
      image: "https://picsum.photos/300/300?random=1",
      backgroundColor: "#4A90E2",
    },
    {
      id: 2,
      title: "Stay Connected",
      subtitle: "Never miss a moment",
      description: "Get real-time notifications and updates from your friends and family. Share your experiences and create lasting memories together.",
      image: "https://picsum.photos/300/300?random=2",
      backgroundColor: "#7B68EE",
    },
    {
      id: 3,
      title: "Get Started",
      subtitle: "Ready to begin?",
      description: "You're all set! Tap the button below to start exploring all the amazing features we have prepared for you.",
      image: "https://picsum.photos/300/300?random=3",
      backgroundColor: "#50C878",
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentPage(roundIndex);
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    scrollViewRef.current?.scrollTo({
      x: pageIndex * width,
      animated: true,
    });
  };

  const handleGetStarted = () => {
    console.log('Getting started...');
  };

  const renderPage = (item: TutorialItem, index: number) => (
    <View key={item.id} style={[styles.page, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        {index === tutorialData.length - 1 && (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {tutorialData.map((item, index) => renderPage(item, index))}
      </ScrollView>

      <View style={styles.indicatorContainer}>
        {tutorialData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.indicator,
              currentPage === index ? styles.activeIndicator : styles.inactiveIndicator,
            ]}
            onPress={() => goToPage(index)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={handleGetStarted}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  imageContainer: {
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  getStartedButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 15,
  },
  skipText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default TutorialScreen;