import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import { dummyCart } from "@/assets/assets";
import { Product } from "@/constants/types";

export type CartItem = {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    size: string;
    price: number;
};

type CartContextType = {
    cartItems: CartItem[];

    addToCart: (
        product: Product,
        size: string
    ) => Promise<void>;

    removeFromCart: (
        itemId: string,
        size: string
    ) => Promise<void>;

    updateQuantity: (
        itemId: string,
        quantity: number,
        size: string
    ) => Promise<void>;

    clearCart: () => Promise<void>;

    cartTotal: number;
    itemCount: number;
    isLoading: boolean;
};

const CartContext =
    createContext<CartContextType | undefined>(
        undefined
    );

export function CartProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [cartItems, setCartItems] =
        useState<CartItem[]>([]);

    const [isLoading, setIsLoading] =
        useState(false);

    const [cartTotal, setCartTotal] =
        useState(0);

    const fetchCart = async () => {

        setIsLoading(true);

        const serverCart = dummyCart;

        const mappedItems: CartItem[] =
            serverCart.items.map((item: any) => ({

                id: item.product._id,
                productId: item.product._id,
                product: item.product,
                quantity: item.quantity,
                size: item?.size || "M",
                price: item.price,

            }));

        setCartItems(mappedItems);

        setCartTotal(serverCart.totalAmount);

        setIsLoading(false);
    };

    const addToCart = async (
        product: Product,
        size: string
    ) => {

        setCartItems((prev) => {

            const existingItem = prev.find(
                (item) =>
                    item.productId === product._id &&
                    item.size === size
            );

            if (existingItem) {

                return prev.map((item) =>
                    item.productId === product._id &&
                    item.size === size
                        ? {
                              ...item,
                              quantity:
                                  item.quantity + 1,
                          }
                        : item
                );
            }

            const newItem: CartItem = {
                id: Date.now().toString(),
                productId: product._id,
                product,
                quantity: 1,
                size,
                price: product.price,
            };

            return [...prev, newItem];
        });
    };

    const removeFromCart = async (
        itemId: string,
        size: string
    ) => {

        setCartItems((prev) =>
            prev.filter(
                (item) =>
                    !(
                        item.productId === itemId &&
                        item.size === size
                    )
            )
        );
    };

    const updateQuantity = async (
        itemId: string,
        quantity: number,
        size: string = "M"
    ) => {

        if (quantity <= 0) {

            await removeFromCart(
                itemId,
                size
            );

            return;
        }

        setCartItems((prev) =>
            prev.map((item) =>
                item.productId === itemId &&
                item.size === size
                    ? {
                          ...item,
                          quantity,
                      }
                    : item
            )
        );
    };

    const clearCart = async () => {

        setCartItems([]);
        setCartTotal(0);
    };

    useEffect(() => {

        const total = cartItems.reduce(
            (sum, item) =>
                sum +
                item.price * item.quantity,
            0
        );

        setCartTotal(total);

    }, [cartItems]);

    const itemCount = cartItems.reduce(
        (sum, item) =>
            sum + item.quantity,
        0
    );

    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                itemCount,
                isLoading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export default function useCart() {

    const context =
        useContext(CartContext);

    if (!context) {

        throw new Error(
            "useCart must be used within a CartProvider"
        );
    }

    return context;
}