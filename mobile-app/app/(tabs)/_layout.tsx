import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialIcons, FontAwesome, Feather, Entypo } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <ThemeToggle />
          </View>
        ),
        headerShown: true,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="donations"
        options={{
          title: 'Donations',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="money" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Members',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="responsive-demo"
        options={{
          title: 'Responsive',
          tabBarIcon: ({ color, size }) => (
            <Feather name="smartphone" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="theme-demo"
        options={{
          title: 'Theme',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="palette" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
