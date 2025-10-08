import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { FAB } from "react-native-paper";
import PostCard from "../../components/PostCard";

type Post = {
  id: string;
  user: string;
  text: string;
  image: string | null;
};

const CommunityFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const dummyPosts: Post[] = [
      { id: "1", user: "Mineth", text: "Just planted 3 new trees today!", image: null },
      { id: "2", user: "Nivakaran", text: "Volunteered in a reforestation drive!", image: null },
    ];
    setPosts(dummyPosts);
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
        keyExtractor={(item) => item.id}
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
