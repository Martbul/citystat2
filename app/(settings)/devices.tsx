import Header from "@/components/header";
import { useEffect, useState } from "react";
import { StatusBar, Text, View, ActivityIndicator } from "react-native";
import * as Device from "expo-device";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { Octicons } from "@expo/vector-icons";

export default function DataAndPrivacy() {
  const [deviceName, setDeviceName] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      const name =
        Device.deviceName ?? `${Device.manufacturer} ${Device.modelName}`;
      setDeviceName(name || "Unknown Device");
    };

    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocation("Permission denied");
          return;
        }

        const pos = await Location.getCurrentPositionAsync({});
        const geo = await Location.reverseGeocodeAsync(pos.coords);
        const place = geo[0];
        const readable =
          [place.city, place.region, place.country]
            .filter(Boolean)
            .join(", ") || "Unknown Location";
        setLocation(readable);
      } catch (err) {
        setLocation("Location unavailable");
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceInfo();
    fetchLocation();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Devices" />
      <View className="p-4 space-y-4">
        <Text className="text-base text-black">
          Here are all the devices that are currently logged in with your
          CityStat account. You can log out of each one individually or all
          other devices. If you see an entry you don't recognise, log out of
          that device and change your CityStat account password immediately.
        </Text>

        <View className="mt-6">
          <Text className="text-lightPrimaryAccent font-semibold">
            Current Device
          </Text>
          <View className="mt-2 p-4 bg-lightSurface rounded-lg shadow">
            {loading ? (
              <ActivityIndicator size="small" color="#888" />
            ) : (
              <View className="flex flex-row gap-4 items-center">
                <View>
                  <Octicons name="device-mobile" size={24} color="black" />
                </View>
                <View>
                  <Text className="font-bold text-lightPrimaryText">
                    {deviceName}
                  </Text>
                  <Text className="text-lightPrimaryText">{location}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
