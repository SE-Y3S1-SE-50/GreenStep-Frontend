import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { BASE_URL } from "../../constants/config";

const CreatePost = () => {
  const [text, setText] = useState("");
  const router = useRouter();

  const handlePost = async () => {
    if (!text.trim()) {
      Alert.alert("Please write something!");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: "You", // later replace with logged-in user
          text,
        }),
      });

      if (res.ok) {
        console.log("Post created successfully");
        router.back();
      } else {
        Alert.alert("Error creating post");
      }
    } catch (error) {
      console.error("Error posting:", error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
        multiline
        style={{
          borderColor: "#ccc",
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          height: 150,
          marginBottom: 20,
        }}
      />
      <Button title="Post" onPress={handlePost} />
    </View>
  );
};

export default CreatePost;
