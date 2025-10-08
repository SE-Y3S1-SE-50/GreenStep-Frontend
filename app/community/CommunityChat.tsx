import React, { useEffect, useState } from "react";
import { Button, FlatList, TextInput, View } from "react-native";
import { Text } from "react-native-paper";
import io from "socket.io-client";
import { BASE_URL } from "../../constants/config";

const socket = io(BASE_URL);

const CommunityChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      const res = await fetch(`${BASE_URL}/api/chat`);
      const data = await res.json();
      setMessages(data);
    };
    fetchMessages();

    // Listen for new messages
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("sendMessage", { user: "You", message: input });
      setInput("");
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id || item.createdAt}
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
