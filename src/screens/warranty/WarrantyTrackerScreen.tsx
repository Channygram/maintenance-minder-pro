import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { parseISO, differenceInDays, differenceInMonths, format } from 'date-fns';
import { ITEM_ICONS } from '../../utils/constants';

export const WarrantyTrackerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const itemsWithWarranty = useMemo(() => {
    return state.items
      .filter(item => item.warrantyExpiry)
      .map(item => {
        const warrantyDate = parseISO(item.warrantyExpiry!);
        const now = new Date();
        const daysUntilExpiry = differenceInDays(warrantyDate, now);
        const isExpired = daysUntilExpiry < 0;
        
        return {
          ...item,
          warrantyDate,
          daysUntilExpiry,
          isExpired,
        };
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry); // Soonest expiry first
  }, [state.items]);

  const expiredCount = itemsWithWarranty.filter(i => i.isExpired).length;
  const expiringSoonCount = itemsWithWarranty.filter(i => !i.isExpired && i.daysUntilExpiry <= 30).length;

  const getWarrantyStatusColor = (item: typeof itemsWithWarranty[0]) => {
    if (item.isExpired) return colors.danger;
    if (item.daysUntilExpiry <= 30) return colors.warning;
    if (item.daysUntilExpiry <= 90) return colors.primary;
    return colors.secondary;
  };

  const getWarrantyStatusText = (item: typeof itemsWithWarranty[0]) => {
    if (item.isExpired) return 'Expired';
    if (item.daysUntilExpiry === 0) return 'Expires today!';
    if (item.daysUntilExpiry === 1) return 'Expires tomorrow';
    if (item.daysUntilExpiry <= 30) return `Expires in ${item.daysUntilExpiry} days`;
    if (item.daysUntilExpiry <= 90) return `${Math.floor(item.daysUntilExpiry / 30)} months left`;
    return `${Math.floor(item.daysUntilExpiry / 30)} months left`;
  };

  const getItemAge = (purchaseDate?: string) => {
    if (!purchaseDate) return null;
    const purchase = parseISO(purchaseDate);
    const months = differenceInMonths(new Date(), purchase);
    
    if (months < 1) {
      const days = differenceInDays(new Date(), purchase);
      return `${days} days old`;
    }
    if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''} old`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''} old`;
    }
    return `${years}y ${remainingMonths}m old`;
  };

  if (itemsWithWarranty.length === 0) {
    return (
      <View style={commonStyles.container}>
        <ScrollView
          style={commonStyles.scrollContainer}
          contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
        >
          <Text style={styles.title}>Warranty Tracker</Text>
          
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="shield-checkmark" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No warranties tracked</Text>
            <Text style={styles.emptyText}>
              Add purchase dates and warranty expiry to items to track their warranty status
            </Text>
          </Card>
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
        <Text style={styles.title}>Warranty Tracker</Text>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <Card style={{ ...styles.summaryCard, borderLeftColor: colors.danger }}>
            <Text style={styles.summaryValue}>{expiredCount}</Text>
            <Text style={styles.summaryLabel}>Expired</Text>
          </Card>
          <Card style={{ ...styles.summaryCard, borderLeftColor: colors.warning }}>
            <Text style={styles.summaryValue}>{expiringSoonCount}</Text>
            <Text style={styles.summaryLabel}>Expiring Soon</Text>
          </Card>
          <Card style={{ ...styles.summaryCard, borderLeftColor: colors.secondary }}>
            <Text style={styles.summaryValue}>{itemsWithWarranty.length - expiredCount - expiringSoonCount}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </Card>
        </View>

        {/* Warning Banner */}
        {(expiredCount > 0 || expiringSoonCount > 0) && (
          <Card style={styles.warningBanner}>
            <Ionicons name="warning" size={24} color={colors.warning} />
            <Text style={styles.warningText}>
              {expiredCount > 0 && `${expiredCount} warranty${expiredCount > 1 ? 'ies have' : ' has'} expired`}
              {expiredCount > 0 && expiringSoonCount > 0 && ', '}
              {expiringSoonCount > 0 && `${expiringSoonCount} expiring within 30 days`}
            </Text>
          </Card>
        )}

        {/* Items List */}
        <Text style={styles.sectionTitle}>All Warranties</Text>
        
        {itemsWithWarranty.map((item) => {
          const iconName = ITEM_ICONS[item.type] || 'ellipse';
          const age = getItemAge(item.purchaseDate);
          const statusColor = getWarrantyStatusColor(item);

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            >
              <Card>
                <View style={styles.itemRow}>
                  <View style={[styles.iconContainer, { backgroundColor: statusColor + '20' }]}>
                    <Ionicons name={iconName as any} size={24} color={statusColor} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.brand && <Text style={styles.itemBrand}>{item.brand} {item.model}</Text>}
                    {age && <Text style={styles.itemAge}>{age}</Text>}
                  </View>
                  <View style={styles.warrantyInfo}>
                    <Text style={[styles.warrantyStatus, { color: statusColor }]}>
                      {getWarrantyStatusText(item)}
                    </Text>
                    <Text style={styles.warrantyDate}>
                      Expires {format(item.warrantyDate, 'MMM d, yyyy')}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderLeftWidth: 4,
    paddingLeft: 12,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    marginBottom: 24,
    gap: 12,
  },
  warningText: {
    flex: 1,
    color: colors.warning,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  itemBrand: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  itemAge: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  warrantyInfo: {
    alignItems: 'flex-end',
  },
  warrantyStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  warrantyDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
