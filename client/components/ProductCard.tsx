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

    return (

        <View className='w-[48%] mb-4'>

            {/* wishlist button */}
            <TouchableOpacity
                className='absolute top-2 right-2 z-20 p-2 bg-white rounded-full shadow-sm'
                onPress={() => toggleWishlist(product)}
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

            {/* product card */}
            <Link
                href={`/product/${product._id}` as any}
                asChild
            >

                <TouchableOpacity
                    className='bg-white rounded-lg overflow-hidden'
                    activeOpacity={0.8}
                >

                    {/* image section */}
                    <View className='relative h-56 w-full bg-gray-100'>

                        <Image
                            source={{
                                uri: product.images[0],
                            }}
                            className='w-full h-full'
                            resizeMode='cover'
                        />

                        {/* featured badge */}
                        {product.isFeatured && (
                            <View className='absolute top-2 left-2 bg-amber-500 px-2 py-1 rounded'>

                                <Text className='text-black text-xs font-bold uppercase'>
                                    Featured
                                </Text>

                            </View>
                        )}

                    </View>

                    {/* product info */}
                    <View className='p-3'>

                        <View className='flex-row items-center mb-1'>

                            <Ionicons
                                name='star'
                                size={14}
                                color='#ffd700'
                            />

                            <Text className='text-secondary text-xs ml-1'>
                                4.6
                            </Text>

                        </View>

                        <Text
                            className='text-primary font-medium text-sm mb-1'
                            numberOfLines={1}
                        >
                            {product.name}
                        </Text>

                        <Text className='text-primary font-bold text-base'>
                            ${product.price.toFixed(2)}
                        </Text>

                    </View>

                </TouchableOpacity>

            </Link>

        </View>
    )
}