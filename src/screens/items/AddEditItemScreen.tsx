import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, Header, Card } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { ITEM_TYPES, ITEM_SUBTYPES, ITEM_ICONS } from '../../utils/constants';
import { generateId, toISOString } from '../../utils/helpers';
import { getTemplatesForType, createTasksFromTemplates } from '../../services/templates';
import { Item } from '../../context/types';
import { format, parseISO } from 'date-fns';

export const AddEditItemScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { state, addItem, updateItem, addTask } = useApp();
  const itemId = route.params?.itemId;
  const isEditing = !!itemId;

  const existingItem = isEditing ? state.items.find((i) => i.id === itemId) : undefined;

  const [name, setName] = useState(existingItem?.name || '');
  const [type, setType] = useState<string>(existingItem?.type || 'car');
  const [subtype, setSubtype] = useState(existingItem?.subtype || '');
  const [brand, setBrand] = useState(existingItem?.brand || '');
  const [model, setModel] = useState(existingItem?.model || '');
  const [notes, setNotes] = useState(existingItem?.notes || '');
  const [addTemplates, setAddTemplates] = useState(!isEditing);
  const [loading, setLoading] = useState(false);
  
  // Date fields
  const [purchaseDate, setPurchaseDate] = useState(existingItem?.purchaseDate ? parseISO(existingItem.purchaseDate) : null);
  const [warrantyExpiry, setWarrantyExpiry] = useState(existingItem?.warrantyExpiry ? parseISO(existingItem.warrantyExpiry) : null);
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showWarrantyPicker, setShowWarrantyPicker] = useState(false);

  const subtypes = ITEM_SUBTYPES[type] || [];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for this item');
      return;
    }

    setLoading(true);

    try {
      const now = toISOString();
      const item: Item = {
        id: isEditing ? itemId : generateId(),
        name: name.trim(),
        type: type as Item['type'],
        subtype: subtype || undefined,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        purchaseDate: purchaseDate ? purchaseDate.toISOString() : undefined,
        warrantyExpiry: warrantyExpiry ? warrantyExpiry.toISOString() : undefined,
        notes: notes.trim() || undefined,
        createdAt: existingItem?.createdAt || now,
        updatedAt: now,
      };

      if (isEditing) {
        await updateItem(item);
      } else {
        await addItem(item);

        // Add template tasks
        if (addTemplates) {
          const templates = getTemplatesForType(type);
          const tasks = createTasksFromTemplates(item.id, templates, state.settings.defaultReminderDays);
          for (const task of tasks) {
            await addTask(task);
          }
        }
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <Header
        title={isEditing ? 'Edit Item' : 'Add Item'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={commonStyles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
        <Input
          label="Name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g., My Car, Kitchen Fridge"
        />

        {/* Type Selection */}
        <Text style={styles.label}>Type *</Text>
        <View style={styles.typeGrid}>
          {ITEM_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeButton, type === t && styles.typeButtonActive]}
              onPress={() => {
                setType(t);
                setSubtype('');
              }}
            >
              <Ionicons
                name={ITEM_ICONS[t] as any}
                size={24}
                color={type === t ? colors.white : colors.textMuted}
              />
              <Text style={[styles.typeLabel, type === t && styles.typeLabelActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subtype Selection */}
        {subtypes.length > 0 && (
          <>
            <Text style={styles.label}>Subtype</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subtypeScroll}>
              {subtypes.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.subtypeChip, subtype === st && styles.subtypeChipActive]}
                  onPress={() => setSubtype(subtype === st ? '' : st)}
                >
                  <Text style={[styles.subtypeText, subtype === st && styles.subtypeTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Input
          label="Brand"
          value={brand}
          onChangeText={setBrand}
          placeholder="e.g., Honda, Samsung"
        />

        <Input
          label="Model"
          value={model}
          onChangeText={setModel}
          placeholder="e.g., Accord, RF28R7551SR"
        />

        {/* Purchase Date */}
        <Text style={styles.label}>Purchase Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowPurchasePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.dateText, purchaseDate && styles.dateTextActive]}>
            {purchaseDate ? format(purchaseDate, 'MMM d, yyyy') : 'Select date'}
          </Text>
          {purchaseDate && (
            <Ionicons name="close-circle" size={20} color={colors.textMuted} onPress={() => setPurchaseDate(null)} />
          )}
        </TouchableOpacity>

        {/* Warranty Expiry */}
        <Text style={styles.label}>Warranty Expiry</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowWarrantyPicker(true)}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.dateText, warrantyExpiry && styles.dateTextActive]}>
            {warrantyExpiry ? format(warrantyExpiry, 'MMM d, yyyy') : 'Select date'}
          </Text>
          {warrantyExpiry && (
            <Ionicons name="close-circle" size={20} color={colors.textMuted} onPress={() => setWarrantyExpiry(null)} />
          )}
        </TouchableOpacity>

        {/* Simple Date Selection Modal */}
        <Modal visible={showPurchasePicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Purchase Date</Text>
              <View style={styles.quickDates}>
                {[
                  { label: 'Today', date: new Date() },
                  { label: '1 year ago', date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
                  { label: '2 years ago', date: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000) },
                  { label: '3 years ago', date: new Date(Date.now() - 1095 * 24 * 60 * 60 * 1000) },
                  { label: '5 years ago', date: new Date(Date.now() - 1825 * 24 * 60 * 60 * 1000) },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={styles.quickDateButton}
                    onPress={() => {
                      setPurchaseDate(option.date);
                      setShowPurchasePicker(false);
                    }}
                  >
                    <Text style={styles.quickDateText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title="Cancel" variant="outline" onPress={() => setShowPurchasePicker(false)} />
            </View>
          </View>
        </Modal>

        <Modal visible={showWarrantyPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Warranty Expiry</Text>
              <View style={styles.quickDates}>
                {[
                  { label: '1 year', date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
                  { label: '2 years', date: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000) },
                  { label: '3 years', date: new Date(Date.now() + 1095 * 24 * 60 * 60 * 1000) },
                  { label: '5 years', date: new Date(Date.now() + 1825 * 24 * 60 * 60 * 1000) },
                  { label: '10 years', date: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000) },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={styles.quickDateButton}
                    onPress={() => {
                      setWarrantyExpiry(option.date);
                      setShowWarrantyPicker(false);
                    }}
                  >
                    <Text style={styles.quickDateText}>{option.label} from now</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title="Cancel" variant="outline" onPress={() => setShowWarrantyPicker(false)} />
            </View>
          </View>
        </Modal>

        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        {/* Template Tasks Option */}
        {!isEditing && (
          <Card style={styles.templateCard}>
            <TouchableOpacity
              style={styles.templateRow}
              onPress={() => setAddTemplates(!addTemplates)}
            >
              <Ionicons
                name={addTemplates ? 'checkbox' : 'square-outline'}
                size={24}
                color={addTemplates ? colors.primary : colors.textMuted}
              />
              <View style={styles.templateContent}>
                <Text style={styles.templateTitle}>Add recommended tasks</Text>
                <Text style={styles.templateSubtitle}>
                  We'll add common maintenance tasks for your {type}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        )}

        <Button
          title={isEditing ? 'Save Changes' : 'Add Item'}
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  typeLabelActive: {
    color: colors.white,
    fontWeight: '600',
  },
  subtypeScroll: {
    marginBottom: 24,
  },
  subtypeChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  subtypeChipActive: {
    backgroundColor: colors.primary,
  },
  subtypeText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  subtypeTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  templateCard: {
    marginTop: 8,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  templateSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  dateText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 16,
  },
  dateTextActive: {
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  quickDates: {
    gap: 12,
    marginBottom: 24,
  },
  quickDateButton: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickDateText: {
    color: colors.text,
    fontSize: 16,
  },
});
