import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import { Image, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import RNPickerSelect from 'react-native-picker-select';

export const FormBuilderInput = ({ field, formik }: any) => {
  const { name, type, label, placeholder, options = [] } = field;
  
  const hasError = formik.touched[name] && formik.errors[name];
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getText = (key: string) => {
    return key ? (key !== key ? key : key) : "";
  };

 
  const inputStyle = `
    w-full px-6 py-4 rounded-[22px] 
    ${hasError 
      ? 'bg-red-50/80 border-red-200' 
      : 'bg-gray-50/50 border-gray-100'
    } 
    border text-gray-900 text-base font-medium shadow-sm
  `;

 
  const placeholderColor = "#9CA3AF";

  const renderInput = () => {
    switch (type) {
      case "text":
      case "password":
      case "email":
      case "number":
      case "textarea":
        const isTextArea = type === "textarea";
        return (
          <TextInput
          className={`${inputStyle} ${isTextArea ? "h-32 pt-3" : "h-12"}`}            
            placeholder={getText(placeholder)}
            placeholderTextColor={placeholderColor}
            secureTextEntry={type === "password"}
            keyboardType={type === "number" ? "numeric" : "default"}
            multiline={type === "textarea"}
            numberOfLines={type === "textarea" ? 4 : 1}
            textAlignVertical={type === "textarea" ? "top" : "center"}
            onChangeText={formik.handleChange(name)}
            onBlur={formik.handleBlur(name)}
            value={formik.values[name]?.toString() || ""}
          />
        );

      case "select":
        return (
          <View className={inputStyle}>
            <RNPickerSelect
              onValueChange={(val) => formik.setFieldValue(name, val)}
              items={options.map((opt: any) => ({ 
                label: getText(opt.name || opt.label), 
                value: opt.id || opt.value 
              }))}
              placeholder={{ label: getText(placeholder || "choose"), value: null, color: placeholderColor }}
              value={formik.values[name]}
              style={{ 
                inputIOS: { color: '#111827', fontSize: 16 }, 
                inputAndroid: { color: '#111827', fontSize: 16 } 
              }}
            />
          </View>
        );

      case "checkbox":
        return (
          <TouchableOpacity 
            onPress={() => formik.setFieldValue(name, formik.values[name] === 1 ? 0 : 1)}
            className="flex-row items-center px-1 py-2"
          >
            <View className={`w-6 h-6 rounded-lg items-center justify-center border ${formik.values[name] === 1 ? 'bg-green-600 border-green-600' : 'bg-gray-100 border-gray-200'}`}>
               {formik.values[name] === 1 && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className="ml-3 text-sm font-semibold tracking-wider text-gray-700 uppercase">{getText(label || name)}</Text>
          </TouchableOpacity>
        );

      case "date":
        return (
          <TouchableOpacity onPress={() => setShowDatePicker(true)} className={`${inputStyle} flex-row justify-between items-center`}>
            <Text className={formik.values[name] ? "text-gray-900" : "text-gray-400"}>
              {formik.values[name] ? formik.values[name] : getText(placeholder || "choose_date")}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={placeholderColor} />
            {showDatePicker && (
              <DateTimePicker
                value={formik.values[name] ? new Date(formik.values[name]) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, date) => {
                  setShowDatePicker(false);
                  if (date) formik.setFieldValue(name, date.toISOString().split('T')[0]);
                }}
              />
            )}
          </TouchableOpacity>
        );

      case "image":
        return (
          <View className="items-center py-8 border-2 border-dashed bg-gray-50/50 rounded-[30px] border-gray-200">
            {formik.values[name] ? (
              <View className="relative">
                <Image source={{ uri: formik.values[name] }} className="w-32 h-32 mb-4 shadow-md rounded-2xl" />
                <TouchableOpacity 
                  onPress={() => formik.setFieldValue(name, null)}
                  className="absolute p-1 bg-red-500 rounded-full -top-2 -right-2"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <Ionicons name="cloud-upload-outline" size={40} color="#D1D5DB" className="mb-2" />
            )}
            <TouchableOpacity 
                onPress={async () => {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') return;
                  let res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
                  if (!res.canceled) formik.setFieldValue(name, res.assets[0].uri);
                }}
                className="px-6 py-2 bg-green-600 shadow-lg rounded-xl shadow-blue-200"
            >
              <Text className="text-xs font-bold tracking-widest text-white uppercase">{getText("choose_image")}</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="w-full mb-6">
      {label && type !== "checkbox" && (
        <Text className="mb-2 ml-2 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">
          {getText(label)}
        </Text>
      )}
      {renderInput()}
      {hasError && (
        <View className="flex-row items-center mt-2 ml-2">
          <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
          <Text className="ml-1 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
            {getText(formik.errors[name])}
          </Text>
        </View>
      )}
    </View>
  );
};