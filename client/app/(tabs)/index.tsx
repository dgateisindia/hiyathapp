import { BANNERS } from '@/assets/assets'
import AppText from '@/components/AppText'
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
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const MOST_SELLING_PRODUCT_IDS = [
  '6a41f8ff4df0fab1d3f3354e',
  '6a41f8ff4df0fab1d3f33550',
  '6a41f8ff4df0fab1d3f33559',
  '6a41f8ff4df0fab1d3f33567',
  '6a41f8ff4df0fab1d3f3356a',
  '6a41f8ff4df0fab1d3f33556',
]

export default function Home() {
  const router = useRouter()

  const [activeBannerIndex, setActiveBannerIndex] =
    React.useState(0)

  const [bannerWidth, setBannerWidth] =
    React.useState(0)

  const [products, setProducts] =
    React.useState<Product[]>([])

  const [loading, setLoading] =
    React.useState(true)

  const categories = [
    {
      id: 'all',
      name: 'All',
      icon: 'grid',
    },
    ...CATEGORIES,
  ]

  const fetchProducts = async () => {
    try {
      setLoading(true)

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

      if (totalPages > 1) {
        const remainingRequests = Array.from(
          {
            length: totalPages - 1,
          },
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

  const handleBannerScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (bannerWidth <= 0) {
      return
    }

    const contentOffsetX =
      event.nativeEvent.contentOffset.x

    const currentIndex = Math.round(
      contentOffsetX / bannerWidth
    )

    const safeIndex = Math.max(
      0,
      Math.min(
        currentIndex,
        BANNERS.length - 1
      )
    )

    setActiveBannerIndex(safeIndex)
  }

  const popularProducts = React.useMemo(() => {
    return products.slice(0, 4)
  }, [products])

  const mostSellingProducts =
    React.useMemo(() => {
      return MOST_SELLING_PRODUCT_IDS
        .map((productId) =>
          products.find(
            (product) =>
              product._id === productId
          )
        )
        .filter(
          (
            product
          ): product is Product =>
            product !== undefined
        )
    }, [products])

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['top']}
    >
      <Header
        title="Hiyath"
        showMenu
        showCart
        showLogo
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Slider */}
        <View className="mb-6">
          <View
            className="w-full h-48 rounded-xl overflow-hidden bg-gray-200"
            onLayout={(event) => {
              const measuredWidth =
                event.nativeEvent.layout.width

              if (
                measuredWidth > 0 &&
                measuredWidth !== bannerWidth
              ) {
                setBannerWidth(measuredWidth)
              }
            }}
          >
            {bannerWidth > 0 && (
              <ScrollView
                horizontal
                pagingEnabled
                nestedScrollEnabled
                bounces={false}
                showsHorizontalScrollIndicator={
                  false
                }
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={bannerWidth}
                snapToAlignment="start"
                disableIntervalMomentum
                onMomentumScrollEnd={
                  handleBannerScrollEnd
                }
              >
                {BANNERS.map(
                  (banner, index) => (
                    <View
                      key={`${banner.title}-${index}`}
                      className="relative h-48 overflow-hidden"
                      style={{
                        width: bannerWidth,
                      }}
                    >
                      <Image
                        source={{
                          uri: banner.image,
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />

                      <View className="absolute inset-0 bg-black/40" />

                      <View className="absolute left-4 right-4 bottom-4 z-10">
                        <AppText
                          weight="bold"
                          className="text-white text-2xl"
                        >
                          {banner.title}
                        </AppText>

                        <AppText
                          weight="medium"
                          className="text-white text-sm mt-0.5"
                        >
                          {banner.subtitle}
                        </AppText>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          className="mt-2 bg-white px-4 py-2 rounded-full self-start"
                        >
                          <AppText
                            weight="bold"
                            className="text-primary text-xs"
                          >
                            Get Now
                          </AppText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                )}
              </ScrollView>
            )}
          </View>

          {/* Banner Pagination */}
          <View className="flex-row justify-center items-center mt-3 gap-2">
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
            <AppText
              weight="bold"
              className="text-xl text-primary"
            >
              Categories
            </AppText>
          </View>

          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category: any) => (
              <CategoryItem
                key={category.id}
                item={category}
                isSelected={false}
                onPress={() =>
                  router.push({
                    pathname: '/shop' as any,
                    params: {
                      categoryId:
                        category.id === 'all'
                          ? ''
                          : category.name,
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
            <AppText
              weight="bold"
              className="text-xl text-primary"
            >
              Popular
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push('/shop' as any)
              }
            >
              <AppText className="text-secondary text-sm">
                See All
              </AppText>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-10">
              <ActivityIndicator size="large" />
            </View>
          ) : popularProducts.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {popularProducts.map(
                (product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                )
              )}
            </View>
          ) : (
            <View className="items-center py-8">
              <AppText className="text-secondary">
                No products available
              </AppText>
            </View>
          )}
        </View>

        {/* Most Selling Products */}
        <View className="mb-20">
          <View className="flex-row justify-between items-center mb-4">
            <AppText
              weight="bold"
              className="text-xl text-primary"
            >
              Most Selling
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push('/shop' as any)
              }
            >
              <AppText className="text-secondary text-sm">
                See All
              </AppText>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-10">
              <ActivityIndicator size="large" />
            </View>
          ) : mostSellingProducts.length >
            0 ? (
            <View className="flex-row flex-wrap justify-between">
              {mostSellingProducts.map(
                (product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                )
              )}
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