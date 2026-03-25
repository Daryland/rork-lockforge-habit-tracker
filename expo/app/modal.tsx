import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LockForge</Text>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
  },
  closeButton: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
