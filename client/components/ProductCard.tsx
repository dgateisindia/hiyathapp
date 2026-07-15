import { COLORS } from '@/constants'
import { ProductCardProps } from '@/constants/types'
import useWishlist from '@/context/Wishlist'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import React from 'react'
import {
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

export default function ProductCard({
    product,
}: ProductCardProps) {
    const {
        toggleWishlist,
        isInWishlist,
    } = useWishlist()

    const isLiked = isInWishlist(product._id)

    const averageRating = Number(
        product.ratings?.average ?? 0
    )

    const reviewCount = Number(
        product.ratings?.count ??
        product.reviews?.length ??
        0
    )

    const productName =
        product.name ||
        product.title ||
        'Unnamed Product'

    const productImage =
        product.images?.[0] || ''

    return (
        <View className="w-[48%] mb-4">

            {/* Wishlist button */}
            <TouchableOpacity
                className="absolute top-2 right-2 z-20 p-2 bg-white rounded-full shadow-sm"
                onPress={() => toggleWishlist(product)}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={
                        isLiked
                            ? 'heart'
                            : 'heart-outline'
                    }
                    size={20}
                    color={
                        isLiked
                            ? COLORS.accent
                            : COLORS.primary
                    }
                />
            </TouchableOpacity>

            <Link
                href={`/product/${product._id}` as any}
                asChild
            >
                <TouchableOpacity
                    className="bg-white rounded-lg overflow-hidden"
                    activeOpacity={0.8}
                >
                    {/* Product image */}
                    <View className="relative h-56 w-full bg-gray-100">
                        {productImage ? (
                            <Image
                                source={{
                                    uri: productImage,
                                }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-full items-center justify-center">
                                <Ionicons
                                    name="image-outline"
                                    size={40}
                                    color="#9ca3af"
                                />

                                <Text className="text-gray-400 text-xs mt-2">
                                    No image
                                </Text>
                            </View>
                        )}

                        {product.isFeatured && (
                            <View className="absolute top-2 left-2 bg-amber-500 px-2 py-1 rounded">
                                <Text className="text-black text-xs font-bold uppercase">
                                    Featured
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Product information */}
                    <View className="p-3">

                        {/* Rating */}
                        <View className="flex-row items-center mb-1">
                            <Ionicons
                                name={
                                    averageRating > 0
                                        ? 'star'
                                        : 'star-outline'
                                }
                                size={14}
                                color="#ffd700"
                            />

                            <Text className="text-primary text-xs font-medium ml-1">
                                {averageRating.toFixed(1)}
                            </Text>

                            <Text className="text-secondary text-xs ml-1">
                                ({reviewCount})
                            </Text>
                        </View>

                        {/* Product name */}
                        <Text
                            className="text-primary font-medium text-sm mb-1"
                            numberOfLines={2}
                        >
                            {productName}
                        </Text>

                        {/* Price */}
                        <Text className="text-primary font-bold text-base">
                            Rs.{Number(product.price ?? 0).toFixed(2)}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Link>
        </View>
    )
}