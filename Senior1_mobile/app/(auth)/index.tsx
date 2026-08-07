import { FormBuilder } from '@/components/form/FormBuilder';
import { AuthAPI, LoginAPI } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

import React, { useMemo, useState } from 'react';
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CenteredModal } from '@/components/ui/CenterModal';
import * as SecureStore from 'expo-secure-store';
import splash from "../../assets/splash2.png";
export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [signupRole, setSignupRole] = useState<'passenger' | 'driver'>('passenger');
  const [visible, setVisible] = useState(false);

  const setAuth = useAuthStore(state => state.setAuth);

  const openModal = () => setVisible(true);
  const closeModal = () => setVisible(false);


  const passengerFields = useMemo(() => [
    { name: "full_name", type: "text", placeholder: "Full Name", label: "Full Name" },
    { name: "email", type: "email", placeholder: "Email", label: "Email" },
    { name: "phone", type: "text", placeholder: "Phone", label: "Phone" },
    { name: "password", type: "password", placeholder: "Password", label: "Password" },
  ], []);
 
  const driverFields = useMemo(() => [
    { name: "full_name", type: "text", placeholder: "Full Name", label: "Full Name" },
    { name: "phone", type: "text", placeholder: "Phone", label: "Phone" },
    { name: "email", type: "email", placeholder: "Email", label: "Email" },
    { name: "password", type: "password", placeholder: "Password", label: "Password" },
    { name: "vehicle_number", type: "text", placeholder: "Plate Number", label: "Vehicle Number" },
    { name: "vehicle_type", type: "text", placeholder: "Plate type", label: "Vehicle type" },
    {
        name: "license_image",
        type: "image",
        label: "License image"
      },
    {
        name: "id_card_image_1",
        type: "image",
        label: "Front ID image"
      },
    {
        name: "id_card_image_2",
        type: "image",
        label: "Back ID image"
      },
      { name: "has_vehicle", type: "checkbox" ,label: "Has Vehicle"  },

  ], []);

  const loginFields = useMemo(() => [
    { name: "email", type: "email", placeholder: "Email", label: "Email" },
    { name: "password", type: "password", placeholder: "Password", label: "Password" }
  ], []);
const handleAuth = async (values: any) => {
  const token = await SecureStore.getItemAsync('expo_push_token');  
  const signupPayload = {
    ...values,
    expo_push_token:token,
    account_type: signupRole,
  };
  const loginPayload = {
    ...values,
    expo_push_token:token,
  };
  const res =
    authMode === 'login'
      ? await LoginAPI.login(loginPayload)
      : await AuthAPI.signup(signupPayload);

  await setAuth(res);
  closeModal();
  };


  
  return (
    <View className="flex-1 bg-white">

      <ImageBackground source={splash} className="justify-end flex-1">
        <View className="px-8 mb-16">

          <Text className="text-5xl font-extrabold text-black leading-[55px]">
            Smart path,{"\n"}smooth reach.
          </Text>

          <TouchableOpacity
            onPress={() => {
              setAuthMode('login');
              openModal();
            }}
            className="items-center py-5 mt-10 bg-black rounded-3xl"
          >
            <Text className="text-lg font-bold text-white">
              Get Started
            </Text>
          </TouchableOpacity>

        </View>
      </ImageBackground>

      <CenteredModal visible={visible} onClose={closeModal}>

        {authMode === 'login' ? (
          <View>

            <Text className="mb-4 text-3xl font-black">
              Welcome Back
            </Text>

            <FormBuilder
              fields={loginFields}
              query={handleAuth}
              loadingButtonLabel="Sign In"
            />

            <TouchableOpacity onPress={() => setAuthMode('signup')}>
              <Text className="mt-4 text-center text-gray-500">
                Create account
              </Text>
            </TouchableOpacity>

          </View>
        ) : (
          <View>

            <Text className="mb-4 text-3xl font-black">
              Join PTP
            </Text>
            <View className="flex-row p-1 mb-5 bg-gray-100 rounded-2xl">

              <TouchableOpacity
                onPress={() => setSignupRole('passenger')}
                className={`flex-1 py-2 rounded-xl items-center ${
                  signupRole === 'passenger' ? 'bg-white' : ''
                }`}
              >
                <Text className="font-bold">Passenger</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSignupRole('driver')}
                className={`flex-1 py-2 rounded-xl items-center ${
                  signupRole === 'driver' ? 'bg-white' : ''
                }`}
              >
                <Text className="font-bold">Driver</Text>
              </TouchableOpacity>

            </View>

            <FormBuilder
              fields={
                signupRole === 'passenger'
                  ? passengerFields
                  : driverFields
              }
              query={handleAuth}
              loadingButtonLabel="Register"
            />

            <TouchableOpacity onPress={() => setAuthMode('login')}>
              <Text className="mt-4 text-center text-gray-500">
                Already have account
              </Text>
            </TouchableOpacity>

          </View>
        )}

      </CenteredModal>

    </View>
  );
}