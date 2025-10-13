import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { Text } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { getAllPosts } from "../../src/api/posts";

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const data = await getAllPosts();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // 🔁 Re-fetch when screen gains focus (so after posting, it reloads)
  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
          Community Feed
        </Text>
        <TouchableOpacity onPress={() => router.push("/community/CreatePost")}>
          <Text style={{ color: "green", fontWeight: "600" }}>+ New Post</Text>
        </TouchableOpacity>
      </View>

      {/* Post list */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPosts} />
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#f5f5f5",
              marginVertical: 8,
              padding: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "600" }}>{item.user || "Anonymous"}</Text>
            <Text style={{ marginTop: 6 }}>{item.text}</Text>
            <Text style={{ color: "gray", fontSize: 12, marginTop: 4 }}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default Community;
