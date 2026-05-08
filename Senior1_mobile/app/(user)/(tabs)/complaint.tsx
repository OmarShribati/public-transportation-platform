import { FormBuilder } from '@/components/form/FormBuilder';
import { ComplaintAPI } from '@/services/complaintsService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';

export default function ComplaintScreen() {
  const { t } = useTranslation();

  const router = useRouter();

  const complaintFields = [
    [
      {
        name: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Tell us how we can help or what happened...',
        required: true,
      },
      {
        name: 'image',
        type: 'image',
        label: 'Attachment (Optional)',
      },
    ]
  ];

  const validationSchema = Yup.object().shape({
    message: Yup.string().min(10, 'Message is too short').required('Required'),
  });

  const submitComplaint = async (values: any) => {
    const payload: any = { ...values };

    if (!payload.image || payload.image === "" || payload.image === null) {
      delete payload.image;
    }
    await ComplaintAPI.send(payload);
  };

  return (
    <>
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center justify-center bg-white border shadow-sm w-11 h-11 rounded-2xl border-slate-100"
        >
          <Ionicons name="chevron-back" size={22} color="#10b981" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-slate-800 tracking-tight">Help Center</Text>
        <View className="w-11" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-start mb-10">
            <View className="bg-emerald-500/10 px-4 py-1.5 rounded-full mb-3">
              <Text className="text-emerald-700 font-extrabold text-[10px] uppercase tracking-widest">Customer Support</Text>
            </View>

            <Text className="text-3xl font-black leading-tight text-left text-slate-900">
              {"How can we be\n"}
              <Text className="text-emerald-600">Better?</Text>
            </Text>

            <View className="w-16 h-1 mt-4 mb-4 rounded-full bg-emerald-500" />

            <Text className="text-left text-slate-500 text-[14px] leading-6 font-medium">
              We care about every detail you share. Your feedback is the primary driver for improving our services.
            </Text>
          </View>

          <View
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.05,
              shadowRadius: 20,
              elevation: 5,
            }}
            className="bg-white rounded-[32px] p-6 border border-slate-50"
          >
            <FormBuilder
              fields={complaintFields}
              initialValues={{ message: '', image: null }}
              validationSchema={validationSchema}
              query={submitComplaint}
              loadingButtonLabel="Send Feedback"
              sectionWrapperClass="mb-6"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}