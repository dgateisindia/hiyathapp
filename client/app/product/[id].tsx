import { COLORS } from '@/constants';
import api from '@/constants/api';
import { Product } from '@/constants/types';
import useCart from '@/context/CartContext';
import useWishlist from '@/context/Wishlist';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function ProductDetail() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const productId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const router = useRouter();

  const [product, setProduct] =
    React.useState<Product | null>(null);

  const [loading, setLoading] =
    React.useState(true);

  const [selectedSize, setSelectedSize] =
    React.useState<string | null>(null);

  const [activeImageIndex, setActiveImageIndex] =
    React.useState(0);

  const [
    selectedReviewImage,
    setSelectedReviewImage,
  ] = React.useState<string | null>(null);

  const { addToCart, itemCount } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const fetchProduct = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.get(
        `/products/${productId}`
      );

      setProduct(data.data);
    } catch (error: any) {
      console.error(
        'Failed to fetch product:',
        error.response?.data || error
      );

      Toast.show({
        type: 'error',
        text1: 'Failed to fetch product',
        text2:
          error.response?.data?.message ||
          'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-base text-primary">
          Product not found
        </Text>
      </SafeAreaView>
    );
  }

  const reviews = product.reviews ?? [];

  const averageRating = Number(
    product.ratings?.average ?? 0
  );

  const reviewCount = Number(
    product.ratings?.count ??
    reviews.length ??
    0
  );

  const isLiked = isInWishlist(product._id);

  const requiresSize = Boolean(
    product.sizes?.length
  );

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      Toast.show({
        type: 'error',
        text1: 'No size selected',
        text2: 'Please select a size.',
      });

      return;
    }

    addToCart(
      product,
      requiresSize
        ? selectedSize ?? undefined
        : undefined
    );

    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${product.name} added successfully`,
      position: 'top',
    });
  };

  const getReviewImageUrl = (
    image:
      | string
      | {
          url: string;
          publicId?: string;
        }
  ) => {
    return typeof image === 'string'
      ? image
      : image.url;
  };

  const formatReviewDate = (
    createdAt?: string
  ) => {
    if (!createdAt) {
      return '';
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* Product image carousel */}
        <View className="relative mb-6 h-[450px] bg-gray-100">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const slide = Math.round(
                event.nativeEvent.contentOffset.x /
                  event.nativeEvent
                    .layoutMeasurement.width
              );

              setActiveImageIndex(slide);
            }}
          >
            {product.images?.map(
              (image, index) => (
                <Image
                  key={`${index}`}
                  source={
                    typeof image === 'string'
                      ? { uri: image }
                      : image
                  }
                  style={{
                    width,
                    height: 450,
                  }}
                  resizeMode="cover"
                />
              )
            )}
          </ScrollView>

          {/* Header buttons */}
          <View className="absolute left-4 right-4 top-12 z-10 flex-row items-center justify-between">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/80"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                toggleWishlist(product)
              }
              className="h-10 w-10 items-center justify-center rounded-full bg-white/80"
            >
              <Ionicons
                name={
                  isLiked
                    ? 'heart'
                    : 'heart-outline'
                }
                size={24}
                color={
                  isLiked
                    ? COLORS.accent
                    : COLORS.primary
                }
              />
            </TouchableOpacity>
          </View>

          {/* Image pagination dots */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
            {product.images?.map(
              (_, index) => (
                <View
                  key={`${index}`}
                  className={`h-2 rounded-full ${
                    index === activeImageIndex
                      ? 'w-6 bg-primary'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              )
            )}
          </View>
        </View>

        {/* Product details */}
        <View className="px-5">
          {/* Product title and rating */}
          <View className="mb-2 flex-row items-start justify-between">
            <Text className="mr-4 flex-1 text-2xl font-bold text-primary">
              {product.name}
            </Text>

            <View className="mt-1 flex-row items-center">
              <Ionicons
                name="star"
                size={15}
                color="#FFD700"
              />

              <Text className="ml-1 text-sm font-bold text-primary">
                {averageRating.toFixed(1)}
              </Text>

              <Text className="ml-1 text-xs text-secondary">
                ({reviewCount})
              </Text>
            </View>
          </View>

          {/* Price */}
          <Text className="mb-6 text-2xl font-bold text-primary">
            Rs.{Number(product.price).toFixed(2)}
          </Text>

          {/* Sizes */}
          {product.sizes &&
            product.sizes.length > 0 && (
              <>
                <Text className="mb-3 text-base font-bold text-primary">
                  Size
                </Text>

                <View className="mb-6 flex-row flex-wrap gap-3">
                  {product.sizes.map(
                    (size) => (
                      <TouchableOpacity
                        key={size}
                        activeOpacity={0.8}
                        onPress={() =>
                          setSelectedSize(size)
                        }
                        className={`h-12 w-12 items-center justify-center rounded-full border ${
                          selectedSize === size
                            ? 'border-primary bg-primary'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            selectedSize ===
                            size
                              ? 'text-white'
                              : 'text-primary'
                          }`}
                        >
                          {size}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </>
            )}

          {/* Description */}
          <Text className="mb-2 text-base font-bold text-primary">
            Description
          </Text>

          <Text className="mb-6 leading-6 text-secondary">
            {product.description}
          </Text>

          {/* Ratings and reviews */}
          <View className="border-t border-gray-200 pt-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-primary">
                Ratings & Reviews
              </Text>

              <Text className="text-sm text-secondary">
                {reviewCount}{' '}
                {reviewCount === 1
                  ? 'review'
                  : 'reviews'}
              </Text>
            </View>

            {/* Rating summary */}
            <View className="mt-4 flex-row items-center rounded-2xl bg-gray-50 p-4">
              <View className="items-center border-r border-gray-200 pr-5">
                <Text className="text-3xl font-bold text-primary">
                  {averageRating.toFixed(1)}
                </Text>

                <View className="mt-2 flex-row">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <Ionicons
                        key={star}
                        name={
                          star <=
                          Math.round(
                            averageRating
                          )
                            ? 'star'
                            : 'star-outline'
                        }
                        size={16}
                        color="#FFD700"
                      />
                    )
                  )}
                </View>
              </View>

              <View className="ml-5 flex-1">
                <Text className="text-base font-semibold text-primary">
                  Customer ratings
                </Text>

                <Text className="mt-1 text-sm leading-5 text-secondary">
                  Based on {reviewCount}{' '}
                  {reviewCount === 1
                    ? 'customer review'
                    : 'customer reviews'}
                </Text>
              </View>
            </View>

            {/* No reviews */}
            {reviews.length === 0 ? (
              <View className="mt-5 items-center rounded-2xl border border-gray-200 p-6">
                <Ionicons
                  name="chatbubble-outline"
                  size={30}
                  color={COLORS.secondary}
                />

                <Text className="mt-3 text-base font-semibold text-primary">
                  No reviews yet
                </Text>

                <Text className="mt-1 text-center text-sm leading-5 text-secondary">
                  Customers who purchased and
                  received this product can add a
                  review.
                </Text>
              </View>
            ) : (
              reviews.map((review) => {
                const currentRating =
                  Number(review.rating ?? 0);

                const reviewImages =
                  review.images ?? [];

                return (
                  <View
                    key={review._id}
                    className="mt-5 border-b border-gray-200 pb-6"
                  >
                    {/* Customer information */}
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 flex-row items-center">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                          <Ionicons
                            name="person"
                            size={19}
                            color="#FFFFFF"
                          />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text className="text-sm font-semibold text-primary">
                            Verified Customer
                          </Text>

                          <View className="mt-1 flex-row items-center">
                            <Ionicons
                              name="checkmark-circle"
                              size={14}
                              color="#16A34A"
                            />

                            <Text className="ml-1 text-xs text-green-600">
                              Verified purchase
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Text className="ml-3 text-xs text-gray-400">
                        {formatReviewDate(
                          review.createdAt
                        )}
                      </Text>
                    </View>

                    {/* Review rating */}
                    <View className="mt-4 flex-row items-center">
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <Ionicons
                            key={star}
                            name={
                              star <=
                              currentRating
                                ? 'star'
                                : 'star-outline'
                            }
                            size={18}
                            color="#FFD700"
                          />
                        )
                      )}

                      <Text className="ml-2 text-sm font-semibold text-primary">
                        {currentRating.toFixed(
                          1
                        )}
                      </Text>
                    </View>

                    {/* Written review */}
                    {review.review?.trim() ? (
                      <Text className="mt-3 text-sm leading-6 text-primary">
                        {review.review}
                      </Text>
                    ) : null}

                    {/* Review photos */}
                    {reviewImages.length > 0 ? (
                      <View className="mt-4">
                        <Text className="mb-3 text-sm font-semibold text-primary">
                          Customer photos
                        </Text>

                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={
                            false
                          }
                        >
                          {reviewImages.map(
                            (
                              reviewImage,
                              imageIndex
                            ) => {
                              const imageUrl =
                                getReviewImageUrl(
                                  reviewImage
                                );

                              return (
                                <TouchableOpacity
                                  key={`${review._id}-${imageIndex}`}
                                  activeOpacity={
                                    0.85
                                  }
                                  onPress={() =>
                                    setSelectedReviewImage(
                                      imageUrl
                                    )
                                  }
                                  className="mr-3 overflow-hidden rounded-xl border border-gray-200"
                                >
                                  <Image
                                    source={{
                                      uri: imageUrl,
                                    }}
                                    className="h-24 w-24"
                                    resizeMode="cover"
                                  />
                                </TouchableOpacity>
                              );
                            }
                          )}
                        </ScrollView>
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom cart footer */}
      <View className="absolute bottom-0 left-0 right-0 flex-row border-t border-gray-100 bg-white p-4">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAddToCart}
          className="w-4/5 flex-row items-center justify-center rounded-full bg-primary py-4 shadow-lg"
        >
          <Ionicons
            name="bag-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text className="ml-2 text-base font-bold text-white">
            Add to Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push('/(tabs)/cart')
          }
          className="relative w-1/5 flex-row justify-center py-3"
        >
          <Ionicons
            name="cart-outline"
            size={26}
            color={COLORS.primary}
          />

          <View className="absolute right-4 top-2 z-10 h-4 w-4 items-center justify-center rounded-full bg-black">
            <Text className="text-[9px] text-white">
              {itemCount}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Full-screen review image */}
      <Modal
        visible={Boolean(
          selectedReviewImage
        )}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setSelectedReviewImage(null)
        }
      >
        <View className="flex-1 items-center justify-center bg-black/95">
          <Pressable
            className="absolute inset-0"
            onPress={() =>
              setSelectedReviewImage(null)
            }
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setSelectedReviewImage(null)
            }
            className="absolute right-5 top-14 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/20"
          >
            <Ionicons
              name="close"
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {selectedReviewImage ? (
            <Image
              source={{
                uri: selectedReviewImage,
              }}
              style={{
                width,
                height: width,
              }}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}