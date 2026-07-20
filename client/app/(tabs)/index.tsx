import { BANNERS } from '@/assets/assets'
import CategoryItem from '@/components/CategoryItem'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import { CATEGORIES } from '@/constants'
import api from '@/constants/api'
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
import AppText from '@/components/AppText'

const MOST_SELLING_PRODUCT_IDS = [
  '6a41f8ff4df0fab1d3f3354e',
  '6a41f8ff4df0fab1d3f33550',
  '6a41f8ff4df0fab1d3f33559',
  '6a41f8ff4df0fab1d3f33567',
  '6a41f8ff4df0fab1d3f3356a',
  '6a41f8ff4df0fab1d3f33556',
]

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
  try {
    setLoading(true)

    // Fetch the first page
    const firstResponse = await api.get('products', {
      params: {
        page: 1,
        limit: 100,
      },
    })

    const firstPageProducts: Product[] =
      firstResponse.data.data ?? []

    const totalPages = Number(
      firstResponse.data.pagination?.pages ?? 1
    )

    let allProducts: Product[] = [
      ...firstPageProducts,
    ]

    // Fetch the remaining pages
    if (totalPages > 1) {
      const remainingRequests = Array.from(
        { length: totalPages - 1 },
        (_, index) =>
          api.get('products', {
            params: {
              page: index + 2,
              limit: 100,
            },
          })
      )

      const remainingResponses =
        await Promise.all(remainingRequests)

      const remainingProducts =
        remainingResponses.flatMap(
          (response) =>
            response.data.data ?? []
        )

      allProducts = [
        ...allProducts,
        ...remainingProducts,
      ]
    }

    console.log(
      'Total products available:',
      firstResponse.data.pagination?.total
    )

    console.log(
      'Total products loaded:',
      allProducts.length
    )

    setProducts(allProducts)
  } catch (error) {
    console.error(
      'Error fetching products:',
      error
    )

    setProducts([])
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchProducts()
  }, [])

  const popularProducts = React.useMemo(() => {
  return products.slice(0, 4)
}, [products])

const mostSellingProducts = React.useMemo(() => {
  return MOST_SELLING_PRODUCT_IDS
    .map((productId) =>
      products.find(
        (product) => product._id === productId
      )
    )
    .filter(
      (product): product is Product =>
        product !== undefined
    )
}, [products])

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <Header title="Hiyath" showMenu showCart showLogo />

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
            <AppText weight="bold" className="text-xl text-primary">
              Categories
            </AppText>
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
            <AppText weight="bold" className="text-xl text-primary">
              Popular
            </AppText>

            <TouchableOpacity
              onPress={() => router.push('/shop' as any)}
            >
              <AppText className="text-secondary text-sm">
                See All
              </AppText>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <View className='flex-row flex-wrap justify-between'>
              {popularProducts.map((product) => (
  <ProductCard
    key={product._id}
    product={product}
  />
))}
            </View>
          )}
        </View>

        {/* Most Selling */}
<View className="mb-20">
  <View className="flex-row justify-between items-center mb-4">
    <AppText weight="bold" className="text-xl text-primary">
      Most Selling
    </AppText>

    <TouchableOpacity
      onPress={() => router.push('/shop' as any)}
    >
      <AppText className="text-secondary text-sm">
        See All
      </AppText>
    </TouchableOpacity>
  </View>

  {loading ? (
    <ActivityIndicator size="large" />
  ) : mostSellingProducts.length > 0 ? (
    <View className="flex-row flex-wrap justify-between">
      {mostSellingProducts.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
        />
      ))}
    </View>
  ) : (
    <View className="items-center py-8">
      <AppText className="text-secondary">
        No selected products available
      </AppText>
    </View>
  )}
</View>

        
        
      </ScrollView>
    </SafeAreaView>
  )
}