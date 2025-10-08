import { View, Text, TextInput, Pressable, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { colors } from '../../src/theme/colors';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createChallenge } from '../../src/api/client';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['energy', 'waste', 'transport', 'water', 'food', 'other']),
  target: z.coerce.number().int().positive('Target must be a positive number'),
  duration: z.coerce.number().int().positive('Duration must be a positive number'),
  unit: z.string().min(1, 'Unit is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export default function CreateChallengeScreen() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other' as const,
    target: '10',
    duration: '7',
    unit: 'days',
    difficulty: 'easy' as const,
    points: '10',
    imageUrl: '',
  });
  const qc = useQueryClient();
  const router = useRouter();

  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      console.log('Mutation function called with data:', challengeData);
      return await createChallenge(challengeData);
    },
    onSuccess: (data) => {
      console.log('Challenge created successfully!', data);
      // Invalidate and refetch challenges
      qc.invalidateQueries({ queryKey: ['challenges'] });
      qc.invalidateQueries({ queryKey: ['userChallenges'] });
      qc.invalidateQueries({ queryKey: ['createdChallenges'] });
      qc.invalidateQueries({ queryKey: ['userProfile'] });
      qc.invalidateQueries({ queryKey: ['userStats'] });
      
      Alert.alert('Success', 'Your challenge has been created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      console.error('Error creating challenge:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      Alert.alert(
        'Error', 
        error?.response?.data?.message || 'Failed to create challenge. Please try again.'
      );
    }
  });

  const onSubmit = () => {
    console.log('Create challenge button clicked!');
    console.log('Form data:', form);
    
    const parsed = schema.safeParse({
      ...form,
      target: Number(form.target),
      duration: Number(form.duration),
      points: form.points ? Number(form.points) : undefined,
      imageUrl: form.imageUrl || undefined,
    });
    
    console.log('Parsed data:', parsed);
    
    if (!parsed.success) {
      console.log('Validation errors:', parsed.error.errors);
      Alert.alert(
        'Invalid form', 
        parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n')
      );
      return;
    }
    
    console.log('Starting challenge creation...');
    createChallengeMutation.mutate(parsed.data);
  };

  const onChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Challenge</Text>
        <View style={{ width: 60 }} />
      </View>
      
      <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Field label="Title">
        <TextInput value={form.title} onChangeText={(t) => onChange('title', t)} style={inputStyle} placeholder="Title" />
      </Field>
      <Field label="Description">
        <TextInput
          value={form.description}
          onChangeText={(t) => onChange('description', t)}
          style={[inputStyle, { height: 90 }]}
          multiline
          placeholder="Describe the challenge"
        />
      </Field>
      <Field label="Category">
        <Row>
          {(['energy', 'waste', 'transport', 'water', 'food', 'other'] as const).map((c) => (
            <Chip key={c} active={form.category === c} onPress={() => onChange('category', c)}>
              {c}
            </Chip>
          ))}
        </Row>
      </Field>
      <Field label="Target">
        <TextInput value={form.target} onChangeText={(t) => onChange('target', t)} style={inputStyle} keyboardType="numeric" placeholder="e.g., 10" />
      </Field>
      <Field label="Duration (days)">
        <TextInput value={form.duration} onChangeText={(t) => onChange('duration', t)} style={inputStyle} keyboardType="numeric" placeholder="e.g., 7" />
      </Field>
      <Field label="Unit">
        <TextInput value={form.unit} onChangeText={(t) => onChange('unit', t)} style={inputStyle} placeholder="e.g., days, times, hours" />
      </Field>
      <Field label="Points (optional)">
        <TextInput value={form.points} onChangeText={(t) => onChange('points', t)} style={inputStyle} keyboardType="numeric" placeholder="e.g., 10" />
      </Field>
      <Field label="Image URL (optional)">
        <TextInput value={form.imageUrl} onChangeText={(t) => onChange('imageUrl', t)} style={inputStyle} placeholder="https://..." />
      </Field>
      <Field label="Difficulty">
        <Row>
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <Chip key={d} active={form.difficulty === d} onPress={() => onChange('difficulty', d)}>
              {d}
            </Chip>
          ))}
        </Row>
      </Field>
      <View style={{ height: 16 }} />
      <TouchableOpacity 
        onPress={onSubmit} 
        disabled={createChallengeMutation.isPending}
        style={{ 
          backgroundColor: createChallengeMutation.isPending ? '#ccc' : colors.primary, 
          padding: 14, 
          borderRadius: 12, 
          alignItems: 'center' 
        }}
      >
        <Text style={{ color: 'white', fontWeight: '800' }}>
          {createChallengeMutation.isPending ? 'Creating...' : 'Create'}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ marginBottom: 6, color: colors.text, fontWeight: '600' }}>{label}</Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{children}</View>;
}

function Chip({ children, active, onPress }: { children: React.ReactNode; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: active ? colors.primary : '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' }}>
      <Text style={{ color: active ? 'white' : colors.text }}>{children}</Text>
    </Pressable>
  );
}

const inputStyle = {
  backgroundColor: '#FFFFFF',
  borderColor: '#E5E7EB',
  borderWidth: 1,
  borderRadius: 12,
  padding: 12,
  color: colors.text,
} as const;

const styles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600' as const,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.text,
  },
};


