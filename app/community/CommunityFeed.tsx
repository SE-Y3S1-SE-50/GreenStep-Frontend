import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { FAB } from "react-native-paper";
import PostCard from "../../components/PostCard";
import { BASE_URL } from "../../constants/config";

type Post = {
  _id: string;
  user: string;
  text: string;
  image: string | null;
  createdAt: string;
};

const CommunityFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
  fetch('http://localhost:8000/api/community')
    .then(res => res.json())
    .then(data => setPosts(data))
    .catch(err => console.error('Error fetching posts:', err));
}, []);
{posts.map((post) => (
  <PostCard key={post._id} post={post} />
))}


  const fetchPosts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/posts`);
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PostCard post={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <FAB
        icon="plus"
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#4CAF50",
        }}
        onPress={() => router.push("/community/CreatePost" as unknown as any)}
      />
    </View>
  );
};

export default CommunityFeed;
