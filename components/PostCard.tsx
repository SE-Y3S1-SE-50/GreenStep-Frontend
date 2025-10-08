// ...existing code...
import React from "react";
import { Image, View } from "react-native";
import { Text } from "react-native-paper";

const PostCard = ({ post }: { post?: any }) => {
  if (!post) return null; // guard against missing prop

  const imageSource =
    post.image && typeof post.image === "string"
      ? { uri: post.image } // remote URL
      : post.image; // local require(...) (number) or already a valid source

  return (
    <View
      style={{
        backgroundColor: "white",
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>{post?.user}</Text>
      <Text style={{ marginVertical: 8 }}>{post?.text}</Text>
      {imageSource && (
        <Image
          source={imageSource}
          style={{ width: "100%", height: 200, borderRadius: 10 }}
        />
      )}
    </View>
  );
};

export default PostCard;
// ...existing code...