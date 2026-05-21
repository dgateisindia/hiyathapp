import { BANNERS, dummyProducts } from '@/assets/assets'
import CategoryItem from '@/components/CategoryItem'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import { CATEGORIES } from '@/constants'
import { Product } from '@/constants/types'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = require('react-native').Dimensions.get('window')

export default function Home() {
  const router = useRouter()

  const [activeBannerIndex, setActiveBannerIndex] = React.useState(0)
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    ...CATEGORIES,
  ]

  const fetchProducts = async () => {
    setProducts(dummyProducts)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <Header title="Forever" showMenu showCart showLogo />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Slider */}
        <View className="mb-6">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="w-full h-48 rounded-xl"
            scrollEventThrottle={16}
            onScroll={(e) => {
              const slide = Math.ceil(
                e.nativeEvent.contentOffset.x /
                  e.nativeEvent.layoutMeasurement.width
              )

              if (slide !== activeBannerIndex) {
                setActiveBannerIndex(slide)
              }
            }}
          >
            {BANNERS.map((banner, index) => (
              <View
                key={index}
                className="relative w-full h-48 bg-gray-200 overflow-hidden rounded-xl"
                style={{ width: width - 32 }}
              >
                <Image
                  source={{ uri: banner.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                <View className="absolute inset-0 bg-black/40" />

                <View className="absolute bottom-4 left-4 z-10">
                  <Text className="text-white text-2xl font-bold">
                    {banner.title}
                  </Text>

                  <Text className="text-white text-sm font-medium">
                    {banner.subtitle}
                  </Text>

                  <TouchableOpacity className="mt-2 bg-white px-4 py-2 rounded-full self-start">
                    <Text className="text-primary font-bold text-xs">
                      Get Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pagination */}
          <View className="flex-row justify-center mt-3 gap-2">
            {BANNERS.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === activeBannerIndex
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-primary">
              Categories
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((cat: any) => (
              <CategoryItem
                key={cat.id}
                item={cat}
                isSelected={false}
                onPress={() =>
                  router.push({
                    pathname: '/shop' as any,
                    params: {
                      categoryId:
                        cat.id === 'all' ? '' : cat.name,
                    },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* Popular Products */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-primary">
              Popular
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/shop' as any)}
            >
              <Text className="text-secondary text-sm">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <View className='flex-row flex-wrap justify-between'>
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product}/>
              ))}
            </View>
          )}
        </View>

        {/*newsletter cta*/}
        <View className='bg-gray-100 p-6 rounded-2xl mb-20 items-center'>
          <Text className='text-2xl font-bold text-primary mb-2 text-center'>Join the Revolution</Text>
          <Text className='text-secondary text-center mb-4'>Subscribe to our newsletter and be the first to know about new products and special offers!</Text>
          <TouchableOpacity className='bg-primary w-4/5 py-3 rounded-full items-center'>
            <Text className='text-white font-medium text-base'>Subscribe Now!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}