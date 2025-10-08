import { StyleSheet, View } from 'react-native';

import CommunityFeed from '../community/CommunityFeed';

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <CommunityFeed/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
