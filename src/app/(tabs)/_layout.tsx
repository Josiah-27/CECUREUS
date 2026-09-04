/**
 * CECUREUS — Bottom Tabs Layout
 *
 * Faithfully matches the Figma prototype bottom navigation bar:
 * - Home (Left 1)
 * - Explore (Left 2)
 * - Ally (Center elevated brand button)
 * - Counsellor (Right 1)
 * - Profile (Right 2)
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../constants/theme';

import { Logo } from '../../components/ui/Logo';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ally"
        options={{
          title: 'Ally',
          tabBarIcon: ({ focused }) => (
            <View style={styles.allyTabButton}>
              <View style={[styles.allyInnerCircle, focused && styles.allyInnerCircleActive]}>
                <Logo size={28} variant="icon" />
              </View>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            color: colors.primary,
          },
        }}
      />
      <Tabs.Screen
        name="counsellor"
        options={{
          title: 'Counsellor',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  allyTabButton: {
    top: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allyInnerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#28C2D6',
    shadowColor: '#28C2D6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  allyInnerCircleActive: {
    backgroundColor: '#F0FAF9',
    borderColor: '#00A99D',
    transform: [{ scale: 1.05 }],
  },
});
