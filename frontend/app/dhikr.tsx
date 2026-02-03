import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const ISLAMIC_GOLD = '#D4AF37';
const ISLAMIC_DARK = '#1A1A2E';
const ISLAMIC_ACCENT = '#16213E';

interface DhikrType {
  id: string;
  name: string;
  arabic: string;
  target: number;
  count: number;
  completed: boolean;
}

const DEFAULT_DHIKR_TYPES: DhikrType[] = [
  { id: '1', name: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', target: 33, count: 0, completed: false },
  { id: '2', name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33, count: 0, completed: false },
  { id: '3', name: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', target: 33, count: 0, completed: false },
  { id: '4', name: 'La ilaha illallah', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', target: 100, count: 0, completed: false },
  { id: '5', name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', target: 100, count: 0, completed: false },
];

export default function DhikrScreen() {
  const insets = useSafeAreaInsets();
  const [dhikrTypes, setDhikrTypes] = useState<DhikrType[]>(DEFAULT_DHIKR_TYPES);
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrType>(DEFAULT_DHIKR_TYPES[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDhikrName, setNewDhikrName] = useState('');
  const [newDhikrArabic, setNewDhikrArabic] = useState('');
  const [newDhikrTarget, setNewDhikrTarget] = useState('33');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadDhikrData();
  }, []);

  const loadDhikrData = async () => {
    try {
      const savedDate = await AsyncStorage.getItem('dhikrDate');
      const today = new Date().toDateString();

      if (savedDate !== today) {
        // Reset counts for new day
        const resetTypes = DEFAULT_DHIKR_TYPES.map(d => ({ ...d, count: 0, completed: false }));
        setDhikrTypes(resetTypes);
        setSelectedDhikr(resetTypes[0]);
        await AsyncStorage.setItem('dhikrDate', today);
        await AsyncStorage.setItem('dhikrTypes', JSON.stringify(resetTypes));
        await AsyncStorage.setItem('todayDhikrCount', '0');
        setTotalCount(0);
      } else {
        const savedTypes = await AsyncStorage.getItem('dhikrTypes');
        const savedTotal = await AsyncStorage.getItem('todayDhikrCount');
        if (savedTypes) {
          const parsed = JSON.parse(savedTypes);
          setDhikrTypes(parsed);
          setSelectedDhikr(parsed[0]);
        }
        if (savedTotal) {
          setTotalCount(parseInt(savedTotal));
        }
      }
    } catch (error) {
      console.log('Error loading dhikr data:', error);
    }
  };

  const saveDhikrData = async (types: DhikrType[], total: number) => {
    try {
      await AsyncStorage.setItem('dhikrTypes', JSON.stringify(types));
      await AsyncStorage.setItem('todayDhikrCount', total.toString());
      await AsyncStorage.setItem('dhikrDate', new Date().toDateString());
    } catch (error) {
      console.log('Error saving dhikr data:', error);
    }
  };

  const incrementCount = useCallback(async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedTypes = dhikrTypes.map((d) => {
      if (d.id === selectedDhikr.id) {
        const newCount = d.count + 1;
        const completed = newCount >= d.target;
        if (completed && !d.completed) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return { ...d, count: newCount, completed };
      }
      return d;
    });

    const newTotal = totalCount + 1;
    setDhikrTypes(updatedTypes);
    setTotalCount(newTotal);
    setSelectedDhikr(updatedTypes.find(d => d.id === selectedDhikr.id)!);
    saveDhikrData(updatedTypes, newTotal);
  }, [dhikrTypes, selectedDhikr, totalCount]);

  const resetCount = () => {
    Alert.alert(
      'Reset Counter',
      `Reset ${selectedDhikr.name} counter to 0?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const updatedTypes = dhikrTypes.map((d) => {
              if (d.id === selectedDhikr.id) {
                return { ...d, count: 0, completed: false };
              }
              return d;
            });
            const resetAmount = selectedDhikr.count;
            const newTotal = Math.max(0, totalCount - resetAmount);
            setDhikrTypes(updatedTypes);
            setTotalCount(newTotal);
            setSelectedDhikr(updatedTypes.find(d => d.id === selectedDhikr.id)!);
            saveDhikrData(updatedTypes, newTotal);
          },
        },
      ]
    );
  };

  const addNewDhikr = () => {
    if (!newDhikrName.trim()) {
      Alert.alert('Error', 'Please enter a name for the dhikr');
      return;
    }

    const newDhikr: DhikrType = {
      id: Date.now().toString(),
      name: newDhikrName.trim(),
      arabic: newDhikrArabic.trim() || newDhikrName.trim(),
      target: parseInt(newDhikrTarget) || 33,
      count: 0,
      completed: false,
    };

    const updatedTypes = [...dhikrTypes, newDhikr];
    setDhikrTypes(updatedTypes);
    saveDhikrData(updatedTypes, totalCount);
    setShowAddModal(false);
    setNewDhikrName('');
    setNewDhikrArabic('');
    setNewDhikrTarget('33');
  };

  const getProgress = () => {
    if (selectedDhikr.target === 0) return 0;
    return Math.min((selectedDhikr.count / selectedDhikr.target) * 100, 100);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dhikr Counter</Text>
        <Text style={styles.headerSubtitle}>Today's Total: {totalCount}</Text>
      </View>

      {/* Dhikr Type Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeSelector}
        contentContainerStyle={styles.typeSelectorContent}
      >
        {dhikrTypes.map((dhikr) => (
          <TouchableOpacity
            key={dhikr.id}
            style={[
              styles.typeChip,
              selectedDhikr.id === dhikr.id && styles.typeChipActive,
              dhikr.completed && styles.typeChipCompleted,
            ]}
            onPress={() => setSelectedDhikr(dhikr)}
          >
            <Text
              style={[
                styles.typeChipText,
                selectedDhikr.id === dhikr.id && styles.typeChipTextActive,
              ]}
              numberOfLines={1}
            >
              {dhikr.name}
            </Text>
            {dhikr.completed && (
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addChip}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color={ISLAMIC_GOLD} />
        </TouchableOpacity>
      </ScrollView>

      {/* Main Counter Area */}
      <View style={styles.counterArea}>
        {/* Arabic Text */}
        <View style={styles.arabicContainer}>
          <Text style={styles.arabicText}>{selectedDhikr.arabic}</Text>
          <Text style={styles.dhikrName}>{selectedDhikr.name}</Text>
        </View>

        {/* Counter Circle */}
        <TouchableOpacity
          style={styles.counterButton}
          onPress={incrementCount}
          activeOpacity={0.7}
        >
          <View style={styles.counterOuter}>
            <View style={styles.counterInner}>
              <Text style={styles.counterNumber}>{selectedDhikr.count}</Text>
              <Text style={styles.counterTarget}>/ {selectedDhikr.target}</Text>
            </View>
          </View>
          {/* Progress Ring */}
          <View style={[styles.progressRing, { transform: [{ rotate: '-90deg' }] }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: selectedDhikr.completed ? '#4CAF50' : ISLAMIC_GOLD,
                  width: `${getProgress()}%`,
                },
              ]}
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.tapHint}>Tap to count</Text>

        {/* Status Message */}
        {selectedDhikr.completed && (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.completedText}>Target Completed! MashaAllah!</Text>
          </View>
        )}

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={resetCount}>
          <Ionicons name="refresh" size={20} color="#888" />
          <Text style={styles.resetText}>Reset Counter</Text>
        </TouchableOpacity>
      </View>

      {/* Add New Dhikr Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Dhikr</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color={ISLAMIC_GOLD} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name (English)</Text>
              <TextInput
                style={styles.textInput}
                value={newDhikrName}
                onChangeText={setNewDhikrName}
                placeholder="e.g., SubhanAllah"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Arabic Text (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.arabicInput]}
                value={newDhikrArabic}
                onChangeText={setNewDhikrArabic}
                placeholder="سُبْحَانَ اللَّهِ"
                placeholderTextColor="#666"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Count</Text>
              <TextInput
                style={styles.textInput}
                value={newDhikrTarget}
                onChangeText={setNewDhikrTarget}
                placeholder="33"
                placeholderTextColor="#666"
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addNewDhikr}>
              <Text style={styles.addButtonText}>Add Dhikr</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');
const COUNTER_SIZE = Math.min(width * 0.6, 250);

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
  typeSelector: {
    maxHeight: 56,
    marginTop: 16,
  },
  typeSelectorContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: ISLAMIC_ACCENT,
    marginRight: 10,
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD + '40',
  },
  typeChipActive: {
    backgroundColor: ISLAMIC_GOLD,
  },
  typeChipCompleted: {
    borderColor: '#4CAF50',
  },
  typeChipText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  typeChipTextActive: {
    color: ISLAMIC_DARK,
    fontWeight: '700',
  },
  checkIcon: {
    marginLeft: 6,
  },
  addChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ISLAMIC_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD + '40',
  },
  counterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  arabicContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  arabicText: {
    fontSize: 36,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  dhikrName: {
    fontSize: 18,
    color: ISLAMIC_GOLD,
    fontWeight: '600',
  },
  counterButton: {
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    borderRadius: COUNTER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  counterOuter: {
    width: COUNTER_SIZE - 20,
    height: COUNTER_SIZE - 20,
    borderRadius: (COUNTER_SIZE - 20) / 2,
    backgroundColor: ISLAMIC_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: ISLAMIC_GOLD,
  },
  counterInner: {
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 56,
    color: ISLAMIC_GOLD,
    fontWeight: '700',
  },
  counterTarget: {
    fontSize: 20,
    color: '#888',
    marginTop: -4,
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: COUNTER_SIZE / 2,
    borderWidth: 4,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    height: 4,
    left: 0,
    top: '50%',
  },
  tapHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50' + '20',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 20,
  },
  resetText: {
    color: '#888',
    fontSize: 14,
    marginLeft: 8,
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
    borderTopWidth: 2,
    borderColor: ISLAMIC_GOLD,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    color: ISLAMIC_GOLD,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: ISLAMIC_ACCENT,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: ISLAMIC_GOLD + '40',
  },
  arabicInput: {
    fontSize: 20,
  },
  addButton: {
    backgroundColor: ISLAMIC_GOLD,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: ISLAMIC_DARK,
    fontSize: 18,
    fontWeight: '700',
  },
});
