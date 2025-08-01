import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";

export default function WitchyToggle(props: {
  heading: string;
  description?: string;
  toggleFunc: () => void;
}) {
  const [toggled, setToggled] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.timing(rotation, {
      toValue: toggled ? 0 : 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    setToggled(!toggled);
    props.toggleFunc();
  };

  const rotateY = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backgroundColor = toggled ? "#7B2CBF" : "#1E1B4B"; // purple hues

  const symbol = toggled ? "🜛" : "✕"; // ✕ off, 🜛 on (alchemy rune)

  return (
    <View style={{ padding: 20 }}>
      <View style={styles.row}>
        <Text style={styles.heading}>{props.heading}</Text>
        <TouchableOpacity onPress={toggle} activeOpacity={0.8}>
          <Animated.View
            style={[
              styles.orb,
              {
                backgroundColor,
                transform: [{ rotateY }],
                shadowColor: toggled ? "#E0AAFF" : "#A78BFA",
              },
            ]}
          >
            <Text style={styles.symbol}>{symbol}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
      {props.description && (
        <Text style={styles.description}>{props.description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3F3CBB",
  },
  description: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14,
  },
  orb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  symbol: {
    fontSize: 22,
    color: "#FFF1F2",
  },
});
