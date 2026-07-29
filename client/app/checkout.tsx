import Header from "@/components/Header";
import { COLORS } from "@/constants";
import api from "@/constants/api";
import { Address } from "@/constants/types";
import useCart from "@/context/CartContext";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useRouter,
} from "expo-router";
import React, {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Checkout() {
  const { getToken } = useAuth();
  const { cartTotal, clearCart } = useCart();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [selectedAddress, setSelectedAddress] =
    useState<Address | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<"cash" | "stripe">("cash");

  const shipping = 2.0;
  const tax = 0;
  const total = cartTotal + shipping + tax;

  /*
   * Fetch the latest address.
   * useCallback keeps the function stable for useFocusEffect.
   */
  const fetchAddress = useCallback(async () => {
    try {
      const token = await getToken();

      const { data } = await api.get("/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const addressList: Address[] = Array.isArray(
        data?.data
      )
        ? data.data
        : [];

      if (addressList.length > 0) {
        const defaultAddress =
          addressList.find(
            (address) => address.isDefault
          ) || addressList[0];

        setSelectedAddress(defaultAddress);
      } else {
        setSelectedAddress(null);
      }
    } catch (error: any) {
      console.error(
        "Error fetching checkout address:",
        error?.response?.data ||
          error?.message ||
          error
      );

      setSelectedAddress(null);

      Toast.show({
        type: "error",
        text1: "Unable to Load Address",
        text2:
          error?.response?.data?.message ||
          "Failed to load your shipping address",
      });
    } finally {
      setPageLoading(false);
    }
  }, [getToken]);

  /*
   * Runs every time the checkout screen becomes active.
   *
   * Checkout -> Add Address -> Back
   * The newly added address is fetched automatically.
   */
  useFocusEffect(
    useCallback(() => {
      fetchAddress();
    }, [fetchAddress])
  );

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Toast.show({
        type: "error",
        text1: "Address Required",
        text2:
          "Please add a shipping address",
      });

      return;
    }

    if (paymentMethod === "stripe") {
      Toast.show({
        type: "info",
        text1: "Coming Soon",
        text2:
          "Card payment is not implemented yet",
      });

      return;
    }

    setLoading(true);

    try {
      const payload = {
        shippingAddress: selectedAddress,
        notes: "Placed via App",
        paymentMethod: "cash",
      };

      const token = await getToken();

      const { data } = await api.post(
        "/orders",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        await clearCart();

        Toast.show({
          type: "success",
          text1: "Order Placed",
          text2:
            "Your order has been placed successfully!",
        });

        router.replace("/orders");
      }
    } catch (error: any) {
      console.log(
        "ORDER ERROR:",
        error?.response?.data || error
      );

      Toast.show({
        type: "error",
        text1: "Failed to Place Order",
        text2:
          error?.response?.data?.message ||
          "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      edges={["top"]}
    >
      <Header title="Checkout" showBack />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
        }}
      >
        {/* Shipping address */}
        <Text className="mb-4 text-lg font-bold text-primary">
          Shipping Address
        </Text>

        {selectedAddress ? (
          <View className="mb-6 rounded-xl bg-white p-4 shadow-sm">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-base font-bold text-primary">
                {selectedAddress.type}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push("/addresses")
                }
                activeOpacity={0.7}
              >
                <Text className="text-sm font-medium text-accent">
                  Change
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="leading-5 text-secondary">
              {selectedAddress.street},{" "}
              {selectedAddress.city}
              {"\n"}
              {selectedAddress.state}{" "}
              {selectedAddress.zipCode}
              {"\n"}
              {selectedAddress.country}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() =>
              router.push("/addresses")
            }
            className="mb-6 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-6"
            activeOpacity={0.8}
          >
            <Ionicons
              name="location-outline"
              size={28}
              color={COLORS.primary}
            />

            <Text className="mt-2 font-bold text-primary">
              Add Address
            </Text>
          </TouchableOpacity>
        )}

        {/* Payment method */}
        <Text className="mb-4 text-lg font-bold text-primary">
          Payment Method
        </Text>

        {/* Cash on delivery */}
        <TouchableOpacity
          className={`mb-4 flex-row items-center justify-between rounded-xl border-2 bg-white p-4 shadow-sm ${
            paymentMethod === "cash"
              ? "border-primary"
              : "border-white"
          }`}
          onPress={() =>
            setPaymentMethod("cash")
          }
          activeOpacity={0.8}
        >
          <View className="flex-1 flex-row items-center">
            <Ionicons
              name="cash-outline"
              size={24}
              color={COLORS.primary}
            />

            <View className="ml-3 flex-1">
              <Text className="text-base font-bold text-primary">
                Cash on Delivery
              </Text>

              <Text className="mt-1 text-xs text-secondary">
                Pay when you receive the order
              </Text>
            </View>
          </View>

          {paymentMethod === "cash" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS.primary}
            />
          )}
        </TouchableOpacity>

        {/* Card payment */}
        <TouchableOpacity
          className={`mb-4 flex-row items-center justify-between rounded-xl border-2 bg-white p-4 shadow-sm ${
            paymentMethod === "stripe"
              ? "border-primary"
              : "border-white"
          }`}
          onPress={() =>
            setPaymentMethod("stripe")
          }
          activeOpacity={0.8}
        >
          <View className="flex-1 flex-row items-center">
            <Ionicons
              name="card-outline"
              size={24}
              color={COLORS.primary}
            />

            <View className="ml-3 flex-1">
              <Text className="text-base font-bold text-primary">
                Pay with Card
              </Text>

              <Text className="mt-1 text-xs text-secondary">
                Credit or debit card
              </Text>
            </View>
          </View>

          {paymentMethod === "stripe" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS.primary}
            />
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Order summary */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: Math.max(
            insets.bottom,
            16
          ),
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}
      >
        <Text className="mb-4 text-lg font-bold text-primary">
          Order Summary
        </Text>

        <View className="mb-2 flex-row justify-between">
          <Text className="text-secondary">
            Subtotal
          </Text>

          <Text className="font-bold text-primary">
            Rs.{cartTotal.toFixed(2)}
          </Text>
        </View>

        <View className="mb-2 flex-row justify-between">
          <Text className="text-secondary">
            Shipping
          </Text>

          <Text className="font-bold text-primary">
            Rs.{shipping.toFixed(2)}
          </Text>
        </View>

        <View className="mb-2 flex-row justify-between">
          <Text className="text-secondary">
            Tax
          </Text>

          <Text className="font-bold text-primary">
            Rs.{tax.toFixed(2)}
          </Text>
        </View>

        <View className="mb-6 flex-row justify-between">
          <Text className="text-xl font-bold text-primary">
            Total
          </Text>

          <Text className="text-xl font-bold text-primary">
            Rs.{total.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          className={`items-center rounded-xl p-4 ${
            loading
              ? "bg-gray-400"
              : "bg-primary"
          }`}
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-lg font-bold text-white">
              Place Order
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}