

import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import React from 'react';
import Mapbox, {MapView} from "@rnmapbox/maps";
  const mapTocken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
Mapbox.setAccessToken(mapTocken);
export default function MapsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
     
     
               <MapView style={styles.map} />
      </View>
      <View style={styles.bottomContainer}>
        {/* Add your bottom content here */}
        <Text>Bottom section</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
   map: {
    flex: 1
  }
});