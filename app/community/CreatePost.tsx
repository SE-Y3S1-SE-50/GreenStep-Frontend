import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { createPost } from "../../src/api/posts";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";

export default function CreatePost() {
  const [text, setText] = useState("");
  const { user } = useAuth(); // should give username or user info
  const router = useRouter();

  const handlePost = async () => {
    if (!text.trim()) {
      Alert.alert("Please enter something to post");
      return;
    }

    try {
      await createPost(user?.username || "Anonymous", text.trim());
      setText("");
      router.back(); // 👈 go back to community.tsx (feed)
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to create post. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
      />
      <Button title="Post" onPress={handlePost} color="#16a34a" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 120,
    marginBottom: 12,
    textAlignVertical: "top",
  },
});
