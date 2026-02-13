import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { parseISO, format } from 'date-fns';
import { ITEM_ICONS } from '../utils/constants';

interface SearchResult {
  type: 'item' | 'task' | 'log';
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
}

export const GlobalSearchModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const results: SearchResult[] = React.useMemo(() => {
    if (query.length < 2) return [];

    const q = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search items
    state.items.forEach(item => {
      if (
        item.name.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.model?.toLowerCase().includes(q)
      ) {
        searchResults.push({
          type: 'item',
          id: item.id,
          title: item.name,
          subtitle: `${item.brand || ''} ${item.model || ''}`.trim() || item.type,
          icon: ITEM_ICONS[item.type] || 'ellipse',
          action: () => {
            onClose();
            navigation.navigate('ItemDetail', { itemId: item.id });
          },
        });
      }
    });

    // Search tasks
    state.tasks.forEach(task => {
      if (
        task.name.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q)
      ) {
        const item = state.items.find(i => i.id === task.itemId);
        searchResults.push({
          type: 'task',
          id: task.id,
          title: task.name,
          subtitle: `${item?.name || 'Unknown'} • Due ${format(parseISO(task.nextDue), 'MMM d')}`,
          icon: 'checkbox',
          action: () => {
            onClose();
            if (item) {
              navigation.navigate('ItemDetail', { itemId: item.id });
            }
          },
        });
      }
    });

    // Search logs
    state.logs.forEach(log => {
      const task = state.tasks.find(t => t.id === log.taskId);
      const item = state.items.find(i => i.id === log.itemId);
      
      if (
        log.notes?.toLowerCase().includes(q) ||
        log.provider?.toLowerCase().includes(q) ||
        task?.name.toLowerCase().includes(q)
      ) {
        searchResults.push({
          type: 'log',
          id: log.id,
          title: task?.name || 'Maintenance',
          subtitle: `${item?.name || ''} • ${format(parseISO(log.completedAt), 'MMM d, yyyy')}`,
          icon: 'checkmark-circle',
          action: () => {
            onClose();
            if (item) {
              navigation.navigate('ItemDetail', { itemId: item.id });
            }
          },
        });
      }
    });

    return searchResults.slice(0, 20); // Limit results
  }, [query, state.items, state.tasks, state.logs, navigation, onClose]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'item': return colors.primary;
      case 'task': return colors.warning;
      case 'log': return colors.secondary;
      default: return colors.textMuted;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'item': return 'Item';
      case 'task': return 'Task';
      case 'log': return 'History';
      default: return type;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Search Header */}
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search items, tasks, history..."
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.resultsContainer}>
            {query.length < 2 ? (
              <View style={styles.hintContainer}>
                <Ionicons name="search" size={48} color={colors.surfaceLight} />
                <Text style={styles.hintText}>Type at least 2 characters to search</Text>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.hintContainer}>
                <Ionicons name="document-text-outline" size={48} color={colors.surfaceLight} />
                <Text style={styles.hintText}>No results found</Text>
              </View>
            ) : (
              <>
                {/* Group by type */}
                {['item', 'task', 'log'].map(type => {
                  const typeResults = results.filter(r => r.type === type);
                  if (typeResults.length === 0) return null;
                  
                  return (
                    <View key={type}>
                      <Text style={styles.typeHeader}>{getTypeLabel(type)}s</Text>
                      {typeResults.map(result => (
                        <TouchableOpacity
                          key={`${result.type}-${result.id}`}
                          style={styles.resultRow}
                          onPress={result.action}
                        >
                          <View style={[styles.resultIcon, { backgroundColor: getTypeColor(result.type) + '20' }]}>
                            <Ionicons name={result.icon as any} size={20} color={getTypeColor(result.type)} />
                          </View>
                          <View style={styles.resultContent}>
                            <Text style={styles.resultTitle}>{result.title}</Text>
                            <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    marginLeft: 12,
  },
  cancelText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  hintContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 16,
  },
  typeHeader: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  resultSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
