import React, { useState } from "react";
import { Button, FlatList, TextInput, View } from "react-native";
import { Text } from "react-native-paper";

const CommunityChat = () => {
  const [messages, setMessages] = useState([
    { id: "1", user: "Mineth", message: "Hello everyone!" },
    { id: "2", user: "Senura", message: "Hi! Excited to start tree planting 🌳" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim()) {
      const newMsg = { id: Date.now().toString(), user: "You", message: input };
    setMessages([...messages, newMsg]);
    setInput("");
  }
};

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: item.user === "You" ? "#DCF8C6" : "#fff",
              padding: 10,
              borderRadius: 10,
              marginVertical: 5,
              alignSelf: item.user === "You" ? "flex-end" : "flex-start",
              maxWidth: "80%",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.user}</Text>
            <Text>{item.message}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TextInput
          placeholder="Type a message"
          value={input}
          onChangeText={setInput}
          style={{
            flex: 1,
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 20,
            paddingHorizontal: 15,
            marginRight: 10,
          }}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default CommunityChat;
