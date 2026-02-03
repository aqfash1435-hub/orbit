import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ISLAMIC_GOLD = '#D4AF37';
const ISLAMIC_DARK = '#1A1A2E';
const ISLAMIC_ACCENT = '#16213E';

const DUAS_DATA = [
  // Morning & Evening
  {
    id: '1',
    title: 'Morning Remembrance',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: "Asbahna wa asbahal mulku lillahi rabbil 'aalameen",
    translation: 'We have reached the morning and the kingdom has reached the morning, belonging to Allah, Lord of the worlds.',
    category: 'Morning',
  },
  {
    id: '2',
    title: 'Evening Remembrance',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: "Amsayna wa amsal mulku lillahi rabbil 'aalameen",
    translation: 'We have reached the evening and the kingdom has reached the evening, belonging to Allah, Lord of the worlds.',
    category: 'Evening',
  },
  // Food
  {
    id: '3',
    title: 'Before Eating',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah.',
    category: 'Food',
  },
  {
    id: '4',
    title: 'After Eating',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimeen",
    translation: 'All praise is due to Allah who gave us food and drink and made us Muslims.',
    category: 'Food',
  },
  // Sleep
  {
    id: '5',
    title: 'Before Sleeping',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    translation: 'In Your name, O Allah, I die and I live.',
    category: 'Sleep',
  },
  {
    id: '6',
    title: 'Upon Waking Up',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    translation: 'All praise is due to Allah who gave us life after death and to Him is the resurrection.',
    category: 'Sleep',
  },
  // Travel
  {
    id: '7',
    title: 'When Leaving Home',
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: "Bismillahi tawakkaltu 'alallahi wa la hawla wa la quwwata illa billah",
    translation: 'In the name of Allah, I put my trust in Allah, and there is no might nor power except with Allah.',
    category: 'Travel',
  },
  {
    id: '8',
    title: 'Upon Entering Home',
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
    transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Allahi rabbina tawakkalna",
    translation: 'In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we place our trust.',
    category: 'Travel',
  },
  // Protection
  {
    id: '9',
    title: 'Seeking Protection',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    category: 'Protection',
  },
  // Forgiveness
  {
    id: '10',
    title: 'Seeking Forgiveness',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha wa atubu ilayh',
    translation: 'I seek forgiveness from Allah and repent to Him.',
    category: 'Forgiveness',
  },
  {
    id: '11',
    title: 'Master of Forgiveness',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    transliteration: "Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana 'abduk",
    translation: 'O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant.',
    category: 'Forgiveness',
  },
  // Gratitude
  {
    id: '12',
    title: 'Expression of Gratitude',
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: 'Alhamdu lillahi rabbil aalameen',
    translation: 'All praise is due to Allah, Lord of all the worlds.',
    category: 'Gratitude',
  },
];

const CATEGORIES = ['All', 'Morning', 'Evening', 'Food', 'Sleep', 'Travel', 'Protection', 'Forgiveness', 'Gratitude'];

export default function DuasScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDua, setSelectedDua] = useState<typeof DUAS_DATA[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem('favoriteDuas');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (duaId: string) => {
    try {
      let newFavorites;
      if (favorites.includes(duaId)) {
        newFavorites = favorites.filter((id) => id !== duaId);
      } else {
        newFavorites = [...favorites, duaId];
      }
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favoriteDuas', JSON.stringify(newFavorites));
    } catch (error) {
      console.log('Error saving favorite:', error);
    }
  };

  const filteredDuas = DUAS_DATA.filter((dua) => {
    const matchesCategory = selectedCategory === 'All' || dua.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.translation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openDuaDetail = (dua: typeof DUAS_DATA[0]) => {
    setSelectedDua(dua);
    setShowModal(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Duas</Text>
        <Text style={styles.headerSubtitle}>Supplications for every occasion</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search duas..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Duas List */}
      <ScrollView style={styles.duasList} showsVerticalScrollIndicator={false}>
        {filteredDuas.map((dua) => (
          <TouchableOpacity
            key={dua.id}
            style={styles.duaCard}
            onPress={() => openDuaDetail(dua)}
          >
            <View style={styles.duaCardHeader}>
              <View style={styles.duaTitleRow}>
                <Text style={styles.duaCardTitle}>{dua.title}</Text>
                <TouchableOpacity
                  onPress={() => toggleFavorite(dua.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={favorites.includes(dua.id) ? 'heart' : 'heart-outline'}
                    size={22}
                    color={favorites.includes(dua.id) ? '#ff4757' : ISLAMIC_GOLD}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.categoryTagSmall}>
                <Text style={styles.categoryTagText}>{dua.category}</Text>
              </View>
            </View>
            <Text style={styles.duaCardArabic} numberOfLines={1}>
              {dua.arabic}
            </Text>
            <Text style={styles.duaCardTranslation} numberOfLines={2}>
              {dua.translation}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Dua Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={28} color={ISLAMIC_GOLD} />
              </TouchableOpacity>
              {selectedDua && (
                <TouchableOpacity onPress={() => toggleFavorite(selectedDua.id)}>
                  <Ionicons
                    name={favorites.includes(selectedDua?.id || '') ? 'heart' : 'heart-outline'}
                    size={28}
                    color={favorites.includes(selectedDua?.id || '') ? '#ff4757' : ISLAMIC_GOLD}
                  />
                </TouchableOpacity>
              )}
            </View>

            {selectedDua && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>{selectedDua.title}</Text>
                  <View style={styles.modalCategoryTag}>
                    <Text style={styles.modalCategoryText}>{selectedDua.category}</Text>
                  </View>
                </View>

                <View style={styles.arabicContainer}>
                  <Text style={styles.modalArabic}>{selectedDua.arabic}</Text>
                </View>

                <View style={styles.transliterationContainer}>
                  <Text style={styles.sectionLabel}>Transliteration</Text>
                  <Text style={styles.modalTransliteration}>{selectedDua.transliteration}</Text>
                </View>

                <View style={styles.translationContainer}>
                  <Text style={styles.sectionLabel}>Translation</Text>
                  <Text style={styles.modalTranslation}>{selectedDua.translation}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ISLAMIC_ACCENT,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
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
  categoriesContainer: {
    maxHeight: 50,
    marginTop: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: ISLAMIC_ACCENT,
    marginRight: 10,
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD + '40',
  },
  categoryChipActive: {
    backgroundColor: ISLAMIC_GOLD,
  },
  categoryChipText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: ISLAMIC_DARK,
    fontWeight: '700',
  },
  duasList: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  duaCard: {
    backgroundColor: ISLAMIC_ACCENT,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD + '30',
  },
  duaCardHeader: {
    marginBottom: 10,
  },
  duaTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duaCardTitle: {
    fontSize: 17,
    color: ISLAMIC_GOLD,
    fontWeight: '600',
    flex: 1,
  },
  categoryTagSmall: {
    backgroundColor: ISLAMIC_GOLD + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  categoryTagText: {
    color: ISLAMIC_GOLD,
    fontSize: 11,
    fontWeight: '600',
  },
  duaCardArabic: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'right',
    marginBottom: 8,
  },
  duaCardTranslation: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 20,
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
    paddingTop: 16,
    maxHeight: '85%',
    borderTopWidth: 2,
    borderColor: ISLAMIC_GOLD,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    color: ISLAMIC_GOLD,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalCategoryTag: {
    backgroundColor: ISLAMIC_GOLD,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
  },
  modalCategoryText: {
    color: ISLAMIC_DARK,
    fontSize: 12,
    fontWeight: '700',
  },
  arabicContainer: {
    backgroundColor: ISLAMIC_ACCENT,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD + '40',
  },
  modalArabic: {
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 52,
  },
  transliterationContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: ISLAMIC_GOLD,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalTransliteration: {
    fontSize: 18,
    color: '#ccc',
    fontStyle: 'italic',
    lineHeight: 28,
  },
  translationContainer: {
    marginBottom: 20,
  },
  modalTranslation: {
    fontSize: 16,
    color: '#aaa',
    lineHeight: 26,
  },
});
