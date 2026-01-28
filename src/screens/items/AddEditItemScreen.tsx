import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
});
