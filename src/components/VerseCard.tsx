import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import type { Verse } from '../types';

type VerseCardProps = {
  dateLabel: string;
  verse: Verse;
};

export const VerseCard = forwardRef<View, VerseCardProps>(({ dateLabel, verse }, ref) => (
  <View ref={ref} collapsable={false} style={styles.card}>
    <Text style={styles.date}>{dateLabel}</Text>
    <Text style={styles.reference}>{verse.reference}</Text>
    <Text style={styles.text}>{verse.text}</Text>
    <View style={styles.metaRow}>
      <Text style={styles.translation}>{verse.translation}</Text>
      <Text style={styles.theme}>{verse.theme}</Text>
    </View>
  </View>
));

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 22,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  date: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reference: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '800',
  },
  text: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 29,
  },
  theme: {
    backgroundColor: colors.soft,
    borderRadius: 6,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  translation: {
    backgroundColor: colors.cardAlt,
    borderRadius: 6,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
});
