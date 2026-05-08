import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { DriverAPI } from '@/services/driverInformationService';
import { useDriverStore } from "@/store/useDriverStore";

const THEME = {
  primary: '#10b981',
  danger: '#ef4444',
  text: '#1e293b',
  accent: '#64748b',
  bg: '#f8fafc'
};

export default function ProfileScreen() {
  const router = useRouter();
  const { driverData, fetchDriverInfo } = useDriverStore(); 

  const [fullName, setFullName] = useState(driverData?.full_name || '');
  const [phone, setPhone] = useState(driverData?.phone || '');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleUpdateProfile = async () => {
    if (!fullName || !phone) {
      Alert.alert("Alert", "Please fill out all fields");
      return;
    }
    setIsUpdating(true);
    try {
      await DriverAPI.updateProfile({
        full_name: fullName,
        phone: phone
      });
      await fetchDriverInfo(); 
      Alert.alert("Success", "Your personal information has been updated successfully.");  
      } catch (error) {
        Alert.alert("Error", "Failed to update information. Please try again.");
      } finally {
      setIsUpdating(false);
    }
  };

  const handleDeactivation = async () => {
    setIsDeactivating(true);
    try {
      await DriverAPI.makeDeactivationReq();
      setShowDeleteModal(false);
      Alert.alert("The request has been sent", "The administrator will review your account deactivation request.");
    } catch (error) {
      Alert.alert("Error", "An error occurred while submitting the request.");
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row-reverse items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-50 rounded-xl">
          <Ionicons name="arrow-forward" size={22} color={THEME.text} />
        </TouchableOpacity>
        <Text className="text-lg font-black text-slate-800">Update Your Profile</Text>
        <View className="w-10" /> 
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center border-4 border-white shadow-sm">
            <Ionicons name="person" size={45} color={THEME.primary} />
          </View>
          <Text className="mt-3 text-xl font-bold text-slate-800">{fullName}</Text>
          <Text className="text-slate-400 text-xs uppercase tracking-widest font-bold">Driver ID: #7721</Text>
        </View>

        <View  className="bg-white p-6  rounded-[30px]  shadow-sm border border-gray-100 mb-6">
          <Text className="text-left text-slate-400 text-[10px] font-black uppercase mb-5 tracking-widest">Personal Information</Text>
          
          <View className="mb-5">
            <Text className="text-left text-slate-600 mb-2 font-bold text-sm">Full Name</Text>
            <TextInput 
              value={fullName}
              onChangeText={setFullName}
              className="bg-gray-50 p-4 rounded-2xl text-left font-bold text-slate-800 border border-gray-100"
              placeholder="Enter Your Name"
            />
          </View>

          <View className="mb-8">
            <Text className="text-left text-slate-600 mb-2 font-bold text-sm">Phone Number</Text>
            <TextInput 
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="bg-gray-50 p-4 rounded-2xl text-left font-bold text-slate-800 border border-gray-100"
              placeholder="09xxxxxxxx"
            />
          </View>

          <TouchableOpacity 
            onPress={handleUpdateProfile}
            disabled={isUpdating}
            className="bg-emerald-500 py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-emerald-200"
          >
            {isUpdating ? <ActivityIndicator color="white" /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{marginRight: 8}} />
                <Text className="text-white font-black text-lg">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => setShowDeleteModal(true)}
          className="flex-row-reverse items-center justify-center p-4 bg-red-50 rounded-2xl border border-red-100"
        >
          <Ionicons name="trash-outline" size={18} color={THEME.danger} />
          <Text className="mr-2 text-red-600 font-bold">Request to deactivate the account</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-8">
          <View className="bg-white w-full p-8 rounded-[40px] items-center">
            <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-5">
              <Ionicons name="warning" size={40} color={THEME.danger} />
            </View>
            
            <Text className="text-xl font-black text-slate-800 mb-2">Are you sure?</Text>
            <Text className="text-center text-slate-500 leading-6 mb-8 font-medium">
            A request will be sent to the system administrators to deactivate your account. You will no longer be able to receive flights after the request is processed.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 py-4 rounded-2xl"
              >
                <Text className="text-center font-bold text-slate-600">Back</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleDeactivation}
                disabled={isDeactivating}
                className="flex-[2] bg-red-500 py-4 rounded-2xl"
              >
                {isDeactivating ? <ActivityIndicator color="white" /> : (
                  <Text className="text-center font-black text-white">Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}