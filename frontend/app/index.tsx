import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const ISLAMIC_GOLD = '#D4AF37';
const ISLAMIC_DARK = '#1A1A2E';
const ISLAMIC_ACCENT = '#16213E';
const ISLAMIC_GREEN = '#2D5A27';

const DAILY_DUAS = [
  {
    id: '1',
    title: 'Morning Dua',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
    transliteration: "Asbahna wa asbahal mulku lillah",
    translation: 'We have entered the morning and the kingdom belongs to Allah.',
    category: 'Morning',
  },
  {
    id: '2',
    title: 'Before Eating',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah.',
    category: 'Food',
  },
  {
    id: '3',
    title: 'Seeking Forgiveness',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah.',
    category: 'Repentance',
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<string>('Loading...');
  const [dailyDua, setDailyDua] = useState(DAILY_DUAS[0]);
  const [todayDhikrCount, setTodayDhikrCount] = useState(0);

  useEffect(() => {
    loadData();
    getLocation();
    selectDailyDua();
  }, []);

  const loadData = async () => {
    try {
      const savedCount = await AsyncStorage.getItem('todayDhikrCount');
      const savedDate = await AsyncStorage.getItem('dhikrDate');
      const today = new Date().toDateString();
      
      if (savedDate === today && savedCount) {
        setTodayDhikrCount(parseInt(savedCount));
      } else {
        setTodayDhikrCount(0);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const getLocation = async () => {
    try {
      const savedCity = await AsyncStorage.getItem('selectedCity');
      if (savedCity) {
        setLocation(savedCity);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Location not enabled');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geocode.length > 0) {
        const city = geocode[0].city || geocode[0].region || 'Unknown';
        setLocation(city);
      }
    } catch (error) {
      setLocation('Location unavailable');
    }
  };

  const selectDailyDua = () => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const index = dayOfYear % DAILY_DUAS.length;
    setDailyDua(DAILY_DUAS[index]);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getIslamicDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Islamic Pattern Header */}
      <View style={styles.header}>
        <View style={styles.patternOverlay} />
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={ISLAMIC_GOLD} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
        <Text style={styles.dateText}>{getIslamicDate()}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Dua Card */}
        <View style={styles.sectionHeader}>
          <View style={styles.decorativeLine} />
          <Text style={styles.sectionTitle}>Daily Dua</Text>
          <View style={styles.decorativeLine} />
        </View>

        <View style={styles.duaCard}>
          <View style={styles.cardBorder}>
            <Text style={styles.duaTitle}>{dailyDua.title}</Text>
            <Text style={styles.duaArabic}>{dailyDua.arabic}</Text>
            <Text style={styles.duaTransliteration}>{dailyDua.transliteration}</Text>
            <Text style={styles.duaTranslation}>{dailyDua.translation}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{dailyDua.category}</Text>
            </View>
          </View>
        </View>

        {/* Dhikr Progress Card */}
        <View style={styles.sectionHeader}>
          <View style={styles.decorativeLine} />
          <Text style={styles.sectionTitle}>Today's Dhikr</Text>
          <View style={styles.decorativeLine} />
        </View>

        <View style={styles.dhikrCard}>
          <View style={styles.dhikrCircle}>
            <Text style={styles.dhikrCount}>{todayDhikrCount}</Text>
            <Text style={styles.dhikrLabel}>counts</Text>
          </View>
          <Text style={styles.dhikrMotivation}>
            {todayDhikrCount === 0
              ? 'Start your dhikr today!'
              : todayDhikrCount < 33
              ? 'Keep going!'
              : todayDhikrCount < 99
              ? 'Great progress!'
              : 'MashaAllah! Excellent!'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <View style={styles.decorativeLine} />
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.decorativeLine} />
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickIconWrapper}>
              <Ionicons name="book" size={28} color={ISLAMIC_GOLD} />
            </View>
            <Text style={styles.quickActionText}>Duas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickIconWrapper}>
              <Ionicons name="radio-button-on" size={28} color={ISLAMIC_GOLD} />
            </View>
            <Text style={styles.quickActionText}>Dhikr</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickIconWrapper}>
              <Ionicons name="heart" size={28} color={ISLAMIC_GOLD} />
            </View>
            <Text style={styles.quickActionText}>Favorites</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ISLAMIC_DARK,
  },
  header: {
    backgroundColor: ISLAMIC_ACCENT,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: ISLAMIC_GOLD,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  bismillah: {
    fontSize: 24,
    color: ISLAMIC_GOLD,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: ISLAMIC_GOLD,
    marginLeft: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  decorativeLine: {
    height: 1,
    width: 40,
    backgroundColor: ISLAMIC_GOLD,
    marginHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: ISLAMIC_GOLD,
    fontWeight: '600',
  },
  duaCard: {
    backgroundColor: ISLAMIC_ACCENT,
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD,
  },
  cardBorder: {
    backgroundColor: ISLAMIC_ACCENT,
    borderRadius: 14,
    padding: 20,
  },
  duaTitle: {
    fontSize: 18,
    color: ISLAMIC_GOLD,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  duaArabic: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 44,
  },
  duaTransliteration: {
    fontSize: 16,
    color: '#ccc',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  duaTranslation: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
  },
  categoryBadge: {
    backgroundColor: ISLAMIC_GOLD,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 16,
  },
  categoryText: {
    color: ISLAMIC_DARK,
    fontSize: 12,
    fontWeight: '700',
  },
  dhikrCard: {
    backgroundColor: ISLAMIC_ACCENT,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD,
  },
  dhikrCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: ISLAMIC_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ISLAMIC_DARK,
  },
  dhikrCount: {
    fontSize: 40,
    color: ISLAMIC_GOLD,
    fontWeight: '700',
  },
  dhikrLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  dhikrMotivation: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 16,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ISLAMIC_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    color: '#ccc',
  },
});
