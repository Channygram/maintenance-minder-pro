import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, Header, EmptyState } from '../../components';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { generateId, toISOString } from '../../utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROVIDERS_KEY = '@maintenance_minder_providers';

interface ServiceProvider {
  id: string;
  name: string;
  type: 'mechanic' | 'plumber' | 'electrician' | 'hvac' | 'handyman' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  notes?: string;
  rating?: number;
  createdAt: string;
}

const PROVIDER_TYPES = [
  { value: 'mechanic', label: 'Mechanic', icon: 'car' },
  { value: 'plumber', label: 'Plumber', icon: 'water' },
  { value: 'electrician', label: 'Electrician', icon: 'flash' },
  { value: 'hvac', label: 'HVAC', icon: 'thermometer' },
  { value: 'handyman', label: 'Handyman', icon: 'construct' },
  { value: 'other', label: 'Other', icon: 'person' },
] as const;

export const ProvidersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<ServiceProvider['type']>('mechanic');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  // Load providers on mount
  React.useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    const data = await AsyncStorage.getItem(PROVIDERS_KEY);
    if (data) {
      setProviders(JSON.parse(data));
    }
  };

  const saveProviders = async (newProviders: ServiceProvider[]) => {
    await AsyncStorage.setItem(PROVIDERS_KEY, JSON.stringify(newProviders));
    setProviders(newProviders);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    const provider: ServiceProvider = {
      id: editingProvider?.id || generateId(),
      name: name.trim(),
      type,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      website: website.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: editingProvider?.createdAt || toISOString(),
    };

    let newProviders: ServiceProvider[];
    if (editingProvider) {
      newProviders = providers.map(p => p.id === editingProvider.id ? provider : p);
    } else {
      newProviders = [...providers, provider];
    }

    await saveProviders(newProviders);
    resetForm();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Provider', 'Are you sure you want to delete this provider?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const newProviders = providers.filter(p => p.id !== id);
          await saveProviders(newProviders);
        },
      },
    ]);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const resetForm = () => {
    setName('');
    setType('mechanic');
    setPhone('');
    setEmail('');
    setAddress('');
    setWebsite('');
    setNotes('');
    setShowAddForm(false);
    setEditingProvider(null);
  };

  const editProvider = (provider: ServiceProvider) => {
    setName(provider.name);
    setType(provider.type);
    setPhone(provider.phone || '');
    setEmail(provider.email || '');
    setAddress(provider.address || '');
    setWebsite(provider.website || '');
    setNotes(provider.notes || '');
    setEditingProvider(provider);
    setShowAddForm(true);
  };

  const getTypeIcon = (providerType: string) => {
    const found = PROVIDER_TYPES.find(t => t.value === providerType);
    return found?.icon || 'person';
  };

  if (showAddForm) {
    return (
      <View style={commonStyles.container}>
        <Header
          title={editingProvider ? 'Edit Provider' : 'Add Provider'}
          showBack
          onBack={resetForm}
        />
        <ScrollView style={commonStyles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
          <Input
            label="Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Joe's Auto Repair"
          />

          <Text style={styles.label}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {PROVIDER_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeChip, type === t.value && styles.typeChipActive]}
                onPress={() => setType(t.value)}
              >
                <Ionicons 
                  name={t.icon as any} 
                  size={18} 
                  color={type === t.value ? colors.white : colors.textMuted} 
                />
                <Text style={[styles.typeChipText, type === t.value && styles.typeChipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="joe@autorepair.com"
            keyboardType="email-address"
          />

          <Input
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="123 Main St, City, ST"
          />

          <Input
            label="Website"
            value={website}
            onChangeText={setWebsite}
            placeholder="https://..."
            keyboardType="url"
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

          <Button
            title={editingProvider ? 'Save Changes' : 'Add Provider'}
            onPress={handleSave}
            style={{ marginTop: 24 }}
          />

          <Button
            title="Cancel"
            variant="outline"
            onPress={resetForm}
            style={{ marginTop: 12 }}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Service Providers</Text>

        {providers.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No providers yet"
            message="Add your trusted mechanics, plumbers, and other service providers"
            actionLabel="Add Provider"
            onAction={() => setShowAddForm(true)}
          />
        ) : (
          <>
            {providers.map((provider) => (
              <Card key={provider.id}>
                <View style={styles.providerHeader}>
                  <View style={styles.providerIcon}>
                    <Ionicons name={getTypeIcon(provider.type) as any} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerType}>
                      {PROVIDER_TYPES.find(t => t.value === provider.type)?.label}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => editProvider(provider)}>
                    <Ionicons name="pencil" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {provider.phone && (
                  <TouchableOpacity style={styles.contactRow} onPress={() => handleCall(provider.phone!)}>
                    <Ionicons name="call" size={18} color={colors.primary} />
                    <Text style={styles.contactText}>{provider.phone}</Text>
                  </TouchableOpacity>
                )}

                {provider.email && (
                  <View style={styles.contactRow}>
                    <Ionicons name="mail" size={18} color={colors.primary} />
                    <Text style={styles.contactText}>{provider.email}</Text>
                  </View>
                )}

                {provider.address && (
                  <View style={styles.contactRow}>
                    <Ionicons name="location" size={18} color={colors.primary} />
                    <Text style={styles.contactText}>{provider.address}</Text>
                  </View>
                )}

                {provider.notes && (
                  <Text style={styles.notes}>{provider.notes}</Text>
                )}

                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(provider.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      {providers.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeScroll: {
    marginBottom: 24,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
  },
  typeChipText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  typeChipTextActive: {
    color: colors.white,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  providerType: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  contactText: {
    color: colors.text,
    fontSize: 14,
  },
  notes: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
    fontStyle: 'italic',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
