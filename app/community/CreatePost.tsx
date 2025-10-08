import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, TextInput, View } from "react-native";

const CreatePost = () => {
  const [text, setText] = useState("");
  const router = useRouter();

  const handlePost = () => {
    console.log("Posted:", text);
    // later we’ll send this to backend
    router.back();
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
