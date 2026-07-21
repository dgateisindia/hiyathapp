import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/Wishlist";
import "@/global.css";
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from "react-native-toast-message";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}> 

    

    <CartProvider>

      <WishlistProvider>

        <Stack screenOptions={{ headerShown: false }} />
        <Toast/>

      </WishlistProvider>

    </CartProvider>
    </ClerkProvider>
    </GestureHandlerRootView>
  );
}