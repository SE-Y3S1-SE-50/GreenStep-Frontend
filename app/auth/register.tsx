import { useState } from 'react';
import { View, TextInput, Button, Alert, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async () => {
    console.log('Register button pressed!');
    console.log('Form data:', form);
    
    if (!form.username || !form.password || !form.firstName || !form.lastName || !form.email || !form.phoneNumber) {
      Alert.alert('Missing fields', 'Please fill all fields');
      return;
    }
    try {
      setSubmitting(true);
      console.log('Attempting registration...');
      console.log('API Base URL:', process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api');
      const res = await register(form);
      console.log('Registration response:', res);
      Alert.alert('Success', res.message || 'Account created successfully!');
      router.replace('/auth/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        statusText: err?.response?.statusText
      });
      const message = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 12, justifyContent: 'center', backgroundColor: colors.surface }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary, textAlign: 'center', marginBottom: 8 }}>Create your GreenStep account</Text>
      <Text style={{ fontSize: 16, color: colors.text, textAlign: 'center', marginBottom: 16 }}>Join challenges and track your impact.</Text>
      <TextInput placeholder="First name" value={form.firstName} onChangeText={(v) => update('firstName', v)} style={{ borderWidth: 1, borderColor: colors.secondary, backgroundColor: '#fff', borderRadius: 10, padding: 12 }} />
      <TextInput placeholder="Last name" value={form.lastName} onChangeText={(v) => update('lastName', v)} style={{ borderWidth: 1, borderColor: colors.secondary, backgroundColor: '#fff', borderRadius: 10, padding: 12 }} />
      <TextInput placeholder="Username" autoCapitalize="none" value={form.username} onChangeText={(v) => update('username', v)} style={{ borderWidth: 1, borderColor: colors.secondary, backgroundColor: '#fff', borderRadius: 10, padding: 12 }} />
      <TextInput placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => update('email', v)} style={{ borderWidth: 1, borderColor: colors.secondary, backgroundColor: '#fff', borderRadius: 10, padding: 12 }} />
      <TextInput placeholder="Phone number" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={(v) => update('phoneNumber', v)} style={{ borderWidth: 1, borderColor: colors.secondary, backgroundColor: '#fff', borderRadius: 10, padding: 12 }} />
      <TextInput placeholder="Password" secureTextEntry value={form.password} onChangeText={(v) => update('password', v)} style={{ borderWidth: 1, borderColor: colors.secondary, backgroundColor: '#fff', borderRadius: 10, padding: 12 }} />
      <View style={{ borderRadius: 10, overflow: 'hidden' }}>
        <Button color={colors.primary} title={submitting ? 'Registering...' : 'Register'} onPress={onSubmit} disabled={submitting} />
      </View>
    </ScrollView>
  );
}


