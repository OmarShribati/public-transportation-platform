import { UserAPI } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const THEME = {
  primary: '#10b981',
  danger: '#ef4444',
  text: '#1e293b',
  accent: '#64748b',
  bg: '#f8fafc'
};

export default function UserProfile() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const response = await UserAPI.getProfile();
      if (response) {
        setFullName(response.full_name);
        setPhone(response.phone);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!fullName || !phone) {
      Alert.alert("Notice", "Please fill in all required fields.");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {
        full_name: fullName,
        phone: phone,
      };



      await UserAPI.updateProfile(updateData);

      Alert.alert("Success", "Your personal information has been updated successfully.");
      setPassword('');
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-50 rounded-xl">
          <Ionicons name="arrow-back" size={22} color={THEME.text} />
        </TouchableOpacity>
        <Text className="text-lg font-black text-slate-800">Edit Profile</Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="items-center mb-8">
          <View className="items-center justify-center w-24 h-24 border-4 border-white rounded-full shadow-sm bg-emerald-100">
            <Ionicons name="person" size={45} color={THEME.primary} />
          </View>
          <Text className="mt-3 text-xl font-bold text-slate-800">{fullName || 'New User'}</Text>
          <Text className="text-xs font-bold tracking-widest uppercase text-slate-400">Passenger Account</Text>
        </View>

        <View className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 mb-6">
          <Text className="text-left text-slate-400 text-[10px] font-black uppercase mb-5 tracking-widest">Personal Information</Text>

          <View className="mb-5">
            <Text className="mb-2 text-sm font-bold text-left text-slate-600">Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              className="p-4 font-bold text-left border border-gray-100 bg-gray-50 rounded-2xl text-slate-800"
              placeholder="Enter your full name"
            />
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-sm font-bold text-left text-slate-600">Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="p-4 font-bold text-left border border-gray-100 bg-gray-50 rounded-2xl text-slate-800"
              placeholder="09xxxxxxxx"
            />
          </View>
          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={isUpdating}
            className="flex-row items-center justify-center py-4 shadow-lg bg-emerald-500 rounded-2xl shadow-emerald-200"
          >
            {isUpdating ? <ActivityIndicator color="white" /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                <Text className="text-lg font-black text-white">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}