import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const ISLAMIC_GOLD = '#D4AF37';
const ISLAMIC_DARK = '#1A1A2E';
const ISLAMIC_ACCENT = '#16213E';

const POPULAR_CITIES = [
  'Mecca, Saudi Arabia',
  'Medina, Saudi Arabia',
  'Cairo, Egypt',
  'Istanbul, Turkey',
  'Dubai, UAE',
  'Kuala Lumpur, Malaysia',
  'Jakarta, Indonesia',
  'London, UK',
  'New York, USA',
  'Toronto, Canada',
  'Sydney, Australia',
  'Paris, France',
  'Berlin, Germany',
  'Karachi, Pakistan',
  'Dhaka, Bangladesh',
  'Lagos, Nigeria',
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [currentLocation, setCurrentLocation] = useState<string>('Not set');
  const [isAutoLocation, setIsAutoLocation] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [dhikrStats, setDhikrStats] = useState({ today: 0, total: 0 });

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const savedCity = await AsyncStorage.getItem('selectedCity');
      const autoLocation = await AsyncStorage.getItem('autoLocation');
      
      if (savedCity) {
        setCurrentLocation(savedCity);
      }
      setIsAutoLocation(autoLocation === 'true');
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const todayCount = await AsyncStorage.getItem('todayDhikrCount');
      const totalCount = await AsyncStorage.getItem('totalDhikrCount');
      setDhikrStats({
        today: todayCount ? parseInt(todayCount) : 0,
        total: totalCount ? parseInt(totalCount) : 0,
      });
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const detectLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please enable location permissions in your device settings to use auto-detect.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const city = geocode[0].city || geocode[0].region || 'Unknown';
        const country = geocode[0].country || '';
        const locationString = country ? `${city}, ${country}` : city;
        
        setCurrentLocation(locationString);
        setIsAutoLocation(true);
        await AsyncStorage.setItem('selectedCity', locationString);
        await AsyncStorage.setItem('autoLocation', 'true');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to detect your location. Please try again or select manually.');
    }
    setIsLoadingLocation(false);
  };

  const selectCity = async (city: string) => {
    setCurrentLocation(city);
    setIsAutoLocation(false);
    await AsyncStorage.setItem('selectedCity', city);
    await AsyncStorage.setItem('autoLocation', 'false');
    setShowCityPicker(false);
    setSearchCity('');
  };

  const resetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all your dhikr counts, favorites, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setCurrentLocation('Not set');
              setIsAutoLocation(false);
              setDhikrStats({ today: 0, total: 0 });
              Alert.alert('Success', 'All data has been reset.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset data.');
            }
          },
        },
      ]
    );
  };

  const filteredCities = POPULAR_CITIES.filter((city) =>
    city.toLowerCase().includes(searchCity.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={22} color={ISLAMIC_GOLD} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.currentLocationRow}>
              <View>
                <Text style={styles.settingLabel}>Current Location</Text>
                <Text style={styles.currentLocationText}>{currentLocation}</Text>
                {isAutoLocation && (
                  <View style={styles.autoBadge}>
                    <Text style={styles.autoBadgeText}>Auto-detected</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.locationButtons}>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={detectLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color={ISLAMIC_GOLD} />
                ) : (
                  <>
                    <Ionicons name="navigate" size={18} color={ISLAMIC_GOLD} />
                    <Text style={styles.locationButtonText}>Auto Detect</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => setShowCityPicker(true)}
              >
                <Ionicons name="search" size={18} color={ISLAMIC_GOLD} />
                <Text style={styles.locationButtonText}>Select City</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={22} color={ISLAMIC_GOLD} />
            <Text style={styles.sectionTitle}>Statistics</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dhikrStats.today}</Text>
              <Text style={styles.statLabel}>Today's Dhikr</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dhikrStats.total || dhikrStats.today}</Text>
              <Text style={styles.statLabel}>Total Dhikr</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color={ISLAMIC_GOLD} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>App Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Developer</Text>
              <Text style={styles.aboutValue}>Muslim Daily App</Text>
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trash" size={22} color="#ff4757" />
            <Text style={[styles.sectionTitle, { color: '#ff4757' }]}>Data Management</Text>
          </View>

          <TouchableOpacity style={styles.dangerCard} onPress={resetAllData}>
            <Ionicons name="refresh" size={22} color="#ff4757" />
            <View style={styles.dangerTextContainer}>
              <Text style={styles.dangerTitle}>Reset All Data</Text>
              <Text style={styles.dangerSubtitle}>Clear all counts, favorites, and settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#ff4757" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* City Picker Modal */}
      <Modal
        visible={showCityPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                <Ionicons name="close" size={28} color={ISLAMIC_GOLD} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchCity}
                onChangeText={setSearchCity}
                placeholder="Search city..."
                placeholderTextColor="#666"
              />
              {searchCity !== '' && (
                <TouchableOpacity onPress={() => setSearchCity('')}>
                  <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.cityList} showsVerticalScrollIndicator={false}>
              {filteredCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={styles.cityItem}
                  onPress={() => selectCity(city)}
                >
                  <Ionicons name="location-outline" size={20} color={ISLAMIC_GOLD} />
                  <Text style={styles.cityItemText}>{city}</Text>
                  {currentLocation === city && (
                    <Ionicons name="checkmark" size={20} color={ISLAMIC_GOLD} />
                  )}
                </TouchableOpacity>
              ))}
              {filteredCities.length === 0 && (
                <Text style={styles.noResults}>No cities found</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ISLAMIC_DARK,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: ISLAMIC_GOLD + '40',
  },
  headerTitle: {
    fontSize: 28,
    color: ISLAMIC_GOLD,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    color: ISLAMIC_GOLD,
    fontWeight: '600',
    marginLeft: 10,
  },
  settingCard: {
    backgroundColor: ISLAMIC_ACCENT,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD + '30',
  },
  currentLocationRow: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  currentLocationText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  autoBadge: {
    backgroundColor: ISLAMIC_GOLD + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  autoBadgeText: {
    color: ISLAMIC_GOLD,
    fontSize: 11,
    fontWeight: '600',
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ISLAMIC_DARK,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD + '40',
  },
  locationButtonText: {
    color: ISLAMIC_GOLD,
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: ISLAMIC_ACCENT,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD + '30',
  },
  statNumber: {
    fontSize: 32,
    color: ISLAMIC_GOLD,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: ISLAMIC_GOLD + '20',
  },
  aboutLabel: {
    fontSize: 15,
    color: '#aaa',
  },
  aboutValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757' + '15',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ff4757' + '40',
  },
  dangerTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  dangerTitle: {
    fontSize: 16,
    color: '#ff4757',
    fontWeight: '600',
  },
  dangerSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: ISLAMIC_DARK,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: '80%',
    borderTopWidth: 2,
    borderColor: ISLAMIC_GOLD,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    color: ISLAMIC_GOLD,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ISLAMIC_ACCENT,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD + '30',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  cityList: {
    flex: 1,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: ISLAMIC_GOLD + '20',
    gap: 12,
  },
  cityItemText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 40,
  },
});
