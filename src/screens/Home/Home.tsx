import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  AppState,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FLOW_CARDS, type AppRoute} from '../../navigation/types';
import {
  loadLastVerifiedMap,
  type VerifiableFlow,
} from '../../services/verificationHistory';
import {getColors} from '../../theme';
import {formatRelativeVerifiedAt} from '../../utils/time';
import {createHomeStyles} from './Home.styles';

export interface HomeScreenProps {
  onSelectFlow: (route: Exclude<AppRoute, 'home'>) => void;
  refreshToken?: number;
}

export function HomeScreen({onSelectFlow, refreshToken = 0}: HomeScreenProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(() => createHomeStyles(colors), [colors]);
  const [verifiedAt, setVerifiedAt] = useState<
    Partial<Record<VerifiableFlow, number>>
  >({});
  const [, setTick] = useState(0);

  const refreshBadges = useCallback(async () => {
    const map = await loadLastVerifiedMap();
    setVerifiedAt(map);
  }, []);

  useEffect(() => {
    refreshBadges();
  }, [refreshBadges, refreshToken]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refreshBadges();
      }
    });
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => {
      sub.remove();
      clearInterval(id);
    };
  }, [refreshBadges]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <View style={styles.content}>
          <Text style={styles.title} accessibilityRole="header">
            Verification
          </Text>
          <Text style={styles.subtitle}>Choose a flow.</Text>

          <View style={styles.securityCallout}>
            <Text style={styles.securityCalloutTitle}>OTP security</Text>
            <Text style={styles.securityCalloutBody}>
              OTPs are not stored on this device.
            </Text>
          </View>

          {FLOW_CARDS.map(card => {
            const ts = verifiedAt[card.id as VerifiableFlow];
            return (
              <Pressable
                key={card.id}
                onPress={() => onSelectFlow(card.id)}
                style={({pressed}) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${card.title}. ${card.subtitle}`}
                testID={`flow-card-${card.id}`}>
                <Text style={styles.icon} accessibilityElementsHidden>
                  {card.icon}
                </Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  {ts ? (
                    <Text style={styles.verifiedBadge}>
                      {formatRelativeVerifiedAt(ts)}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;
