import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    Product,
    WishlistContextType,
} from "@/constants/types";

const WishlistContext =
    createContext<WishlistContextType | undefined>(
        undefined
    );

export function WishlistProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [wishlist, setWishlist] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(false);

    const fetchWishlist = async () => {

        setLoading(true);

        setWishlist([]);

        setLoading(false);
    };

    const toggleWishlist = async (
    product: Product
) => {

    setWishlist((prev) => {

        const exists = prev.some(
            (p) => p._id === product._id
        );

        if (exists) {

            return prev.filter(
                (p) => p._id !== product._id
            );
        }

        return [...prev, product];
    });
};

    const isInWishlist = (
        productId: string
    ): boolean => {

        return wishlist.some(
            (p) => p._id === productId
        );
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                loading,
                toggleWishlist,
                isInWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export default function useWishlist() {

    const context =
        useContext(WishlistContext);

    if (context === undefined) {

        throw new Error(
            "useWishlist must be used within a WishlistProvider"
        );
    }

    return context;
}