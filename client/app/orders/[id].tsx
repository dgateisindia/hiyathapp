import Header from "@/components/Header";
import { COLORS } from "@/constants";
import api from "@/constants/api";
import type {
    Order,
    Product
} from "@/constants/types";

import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import React, {
    useEffect,
    useState
} from "react";

import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

interface ExistingReviewImage {
    url: string;
    publicId: string;
}

export default function OrderDetails() {
    const { getToken } = useAuth();

    const { id } = useLocalSearchParams<{
        id: string | string[];
    }>();

    const orderId = Array.isArray(id)
        ? id[0]
        : id;

    const [order, setOrder] =
        useState<Order | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [
        ratingModalVisible,
        setRatingModalVisible
    ] = useState(false);

    const [
        selectedProductId,
        setSelectedProductId
    ] = useState<string | null>(null);

    const [
        selectedProductName,
        setSelectedProductName
    ] = useState("");

    const [
        selectedRating,
        setSelectedRating
    ] = useState(0);

    const [
        selectedReview,
        setSelectedReview
    ] = useState("");

    const [
        loadingRating,
        setLoadingRating
    ] = useState(false);

    const [
        submittingRating,
        setSubmittingRating
    ] = useState(false);

    const [
    selectedReviewImages,
    setSelectedReviewImages
    ] = useState<ImagePicker.ImagePickerAsset[]>([]);

    const [
    existingReviewImages,
    setExistingReviewImages
    ] = useState<ExistingReviewImage[]>([]);

    const fetchOrderDetails = async () => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const token = await getToken();

            const { data } = await api.get(
                `/orders/${orderId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setOrder(data.data);

        } catch (error: any) {
            console.error(
                "Error fetching order details:",
                error.response?.data ||
                error.message
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const closeRatingModal = () => {
        if (submittingRating) {
            return;
        }

        setRatingModalVisible(false);
        setSelectedProductId(null);
        setSelectedProductName("");
        setSelectedRating(0);
        setSelectedReview("");
        setSelectedReviewImages([]);
        setExistingReviewImages([]);
        setLoadingRating(false);
    };

    const openRatingModal = async (
        productId: string,
        productName: string
    ) => {
        try {
            setSelectedProductId(productId);
            setSelectedProductName(productName);
            setSelectedRating(0);
            setSelectedReview("");
            setRatingModalVisible(true);
            setLoadingRating(true);

            const token = await getToken();

            if (!token) {
                Alert.alert(
                    "Login Required",
                    "Please login again to continue."
                );

                return;
            }

            const { data } = await api.get(
                `/products/${productId}/my-rating`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setSelectedRating(
                data.data?.rating ?? 0
            );

            setExistingReviewImages(
    Array.isArray(data.data?.images)
        ? data.data.images
        : []
);

            setSelectedReview(
                data.data?.review ?? ""
            );

        } catch (error: any) {
            console.log(
                "Fetch existing rating and review error:",
                error.response?.data ||
                error.message
            );

        } finally {
            setLoadingRating(false);
        }
    };

    const pickReviewImages = async () => {
    try {
        if (submittingRating) {
            return;
        }

        const permission =
            await ImagePicker
                .requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                "Permission Required",
                "Please allow photo access to upload product images."
            );

            return;
        }

        const remainingImages =
            5 - selectedReviewImages.length;

        if (remainingImages <= 0) {
            Alert.alert(
                "Image Limit",
                "You can upload a maximum of 5 images."
            );

            return;
        }

        const result =
            await ImagePicker
                .launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    allowsMultipleSelection: true,
                    selectionLimit:
                        remainingImages,
                    quality: 0.8
                });

        if (result.canceled) {
            return;
        }

        const newImages =
            result.assets.filter(
                asset =>
                    asset.type === "image" ||
                    !asset.type
            );

        setSelectedReviewImages(
            currentImages => {
                const combinedImages = [
                    ...currentImages,
                    ...newImages
                ];

                const uniqueImages =
                    combinedImages.filter(
                        (
                            image,
                            index,
                            array
                        ) =>
                            array.findIndex(
                                item =>
                                    item.uri ===
                                    image.uri
                            ) === index
                    );

                return uniqueImages.slice(
                    0,
                    5
                );
            }
        );

        /*
         * New selected images will replace
         * existing Cloudinary review images.
         */
        setExistingReviewImages([]);

    } catch (error) {
        console.error(
            "Image picker error:",
            error
        );

        Alert.alert(
            "Unable to Select Images",
            "Please try selecting the images again."
        );
    }
};

/*
 * This must be outside pickReviewImages
 * so that the JSX can access it.
 */
const removeSelectedReviewImage = (
    imageIndex: number
) => {
    if (submittingRating) {
        return;
    }

    setSelectedReviewImages(
        currentImages =>
            currentImages.filter(
                (_, index) =>
                    index !== imageIndex
            )
    );
};

    const submitRating = async () => {
        if (!selectedProductId) {
            Alert.alert(
                "Product Error",
                "Unable to identify this product."
            );

            return;
        }

        if (selectedRating === 0) {
            Alert.alert(
                "Select Rating",
                "Please select between 1 and 5 stars."
            );

            return;
        }

        const cleanReview =
            selectedReview.trim();

        if (cleanReview.length < 3) {
            Alert.alert(
                "Write a Review",
                "Please write at least 3 characters about the product."
            );

            return;
        }

        if (cleanReview.length > 1000) {
            Alert.alert(
                "Review Too Long",
                "Your review cannot exceed 1000 characters."
            );

            return;
        }

        if (!order?._id) {
            Alert.alert(
                "Order Error",
                "Unable to identify this order."
            );

            return;
        }

        try {
            setSubmittingRating(true);

            const token = await getToken();

            if (!token) {
                Alert.alert(
                    "Login Required",
                    "Please login again to submit your review."
                );

                return;
            }

            const formData = new FormData();

formData.append(
    "rating",
    String(selectedRating)
);

formData.append(
    "review",
    cleanReview
);

formData.append(
    "orderId",
    order._id
);

selectedReviewImages.forEach(
    (image, index) => {
        const extensionFromName =
            image.fileName
                ?.split(".")
                .pop();

        const extensionFromMime =
            image.mimeType
                ?.split("/")
                .pop();

        const extension =
            extensionFromName ||
            extensionFromMime ||
            "jpg";

        formData.append(
            "images",
            {
                uri: image.uri,

                name:
                    image.fileName ||
                    `review-${Date.now()}-${index}.${extension}`,

                type:
                    image.mimeType ||
                    "image/jpeg"
            } as any
        );
    }
);

await api.post(
    `/products/${selectedProductId}/rating`,
    formData,
    {
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    }
);

            Alert.alert(
                "Thank You",
                "Your rating and review have been submitted successfully."
            );

            setRatingModalVisible(false);
            setSelectedProductId(null);
            setSelectedProductName("");
            setSelectedRating(0);
            setSelectedReview("");
            setSelectedReviewImages([]);
            setExistingReviewImages([]);

        } catch (error: any) {
            console.log(
                "Submit rating and review error:",
                error.response?.data ||
                error.message
            );

            Alert.alert(
                "Unable to Submit Review",
                error.response?.data?.message ||
                "Something went wrong."
            );

        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView
                className="flex-1 bg-surface justify-center items-center"
                edges={["top"]}
            >
                <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView
                className="flex-1 bg-surface justify-center items-center"
                edges={["top"]}
            >
                <Text className="text-secondary">
                    Order not found
                </Text>
            </SafeAreaView>
        );
    }

    const formatDate = (
        dateString: string
    ) => {
        const options:
            Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "short",
                day: "numeric"
            };

        return new Date(
            dateString
        ).toLocaleDateString(
            undefined,
            options
        );
    };

    const normalizedOrderStatus =
        String(order.orderStatus).toLowerCase();

    const isDelivered =
        normalizedOrderStatus === "delivered";

    const ORDER_STEPS = [
        {
            title: "Order Placed",
            date: formatDate(order.createdAt),
            completed: true
        },
        {
            title: "Processing",
            date: "",
            completed: [
                "processing",
                "shipped",
                "delivered"
            ].includes(normalizedOrderStatus)
        },
        {
            title: "Shipped",
            date: "",
            completed: [
                "shipped",
                "delivered"
            ].includes(normalizedOrderStatus)
        },
        {
            title: "Delivered",
            date: "",
            completed: isDelivered
        }
    ];

    return (
        <SafeAreaView
            className="flex-1 bg-surface"
            edges={["top"]}
        >
            <Header
                title={`Order #${order.orderNumber}`}
                showBack
            />

            <ScrollView
                className="flex-1 px-4 pt-4"
                contentContainerStyle={{
                    paddingBottom: 30
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Order Status */}
                <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100">

                    <Text className="text-lg font-bold text-primary mb-4">
                        Order Status
                    </Text>

                    {ORDER_STEPS.map(
                        (step, index) => (
                            <View
                                key={step.title}
                                className="flex-row mb-4"
                            >
                                <View className="items-center mr-4">

                                    <View
                                        className={`w-3 h-3 rounded-full ${
                                            step.completed
                                                ? "bg-primary"
                                                : "bg-gray-300"
                                        }`}
                                    />

                                    {index !==
                                        ORDER_STEPS.length -
                                            1 && (
                                        <View
                                            className={`w-0.5 h-full absolute top-3 ${
                                                step.completed
                                                    ? "bg-primary"
                                                    : "bg-gray-300"
                                            }`}
                                        />
                                    )}

                                </View>

                                <View className="pb-4">

                                    <Text
                                        className={`font-bold ${
                                            step.completed
                                                ? "text-primary"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {step.title}
                                    </Text>

                                    {step.date ? (
                                        <Text className="text-secondary text-xs">
                                            {step.date}
                                        </Text>
                                    ) : null}

                                </View>
                            </View>
                        )
                    )}

                </View>

                {/* Products */}
                <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100">

                    <Text className="text-lg font-bold text-primary mb-4">
                        Products
                    </Text>

                    {order.items.map(
                        (
                            item: any,
                            index: number
                        ) => {
                            const productData =
                                item.product as Product;

                            const image =
                                productData
                                    ?.images?.[0];

                            const productId =
                                typeof item.product ===
                                "string"
                                    ? item.product
                                    : productData?._id;

                            return (
                                <View
                                    key={
                                        productId ||
                                        index
                                    }
                                    className={`${
                                        index !==
                                        order.items
                                            .length -
                                            1
                                            ? "border-b border-gray-100 pb-4 mb-4"
                                            : ""
                                    }`}
                                >
                                    <View className="flex-row">

                                        {image ? (
                                            <Image
                                                source={{
                                                    uri: image
                                                }}
                                                className="w-16 h-16 rounded-lg bg-gray-100"
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <View className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center">

                                                <Ionicons
                                                    name="image-outline"
                                                    size={
                                                        22
                                                    }
                                                    color={
                                                        COLORS.secondary
                                                    }
                                                />

                                            </View>
                                        )}

                                        <View className="flex-1 ml-3 justify-center">

                                            <Text
                                                className="text-primary font-medium"
                                                numberOfLines={
                                                    2
                                                }
                                            >
                                                {
                                                    item.name
                                                }
                                            </Text>

                                            <Text className="text-secondary text-xs mt-1">
                                                Size:{" "}
                                                {item.size ||
                                                    "N/A"}
                                            </Text>

                                            <View className="flex-row justify-between items-center mt-2">

                                                <Text className="text-primary font-bold">
                                                    Rs.
                                                    {Number(
                                                        item.price
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </Text>

                                                <Text className="text-secondary text-xs">
                                                    Qty:{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </Text>

                                            </View>

                                        </View>
                                    </View>

                                    {/* Rate and review only after delivery */}
                                    {isDelivered &&
                                        productId && (
                                            <View className="flex-row items-center justify-between mt-4">

                                                <View className="flex-row items-center flex-1 mr-3">

                                                    <Ionicons
                                                        name="star-outline"
                                                        size={
                                                            18
                                                        }
                                                        color="#f5b301"
                                                    />

                                                    <Text className="text-secondary text-sm ml-2">
                                                        How
                                                        was
                                                        this
                                                        product?
                                                    </Text>

                                                </View>

                                                <TouchableOpacity
                                                    onPress={() =>
                                                        openRatingModal(
                                                            productId,
                                                            item.name
                                                        )
                                                    }
                                                    className="bg-black px-4 py-2 rounded-lg"
                                                    activeOpacity={
                                                        0.8
                                                    }
                                                >
                                                    <Text className="text-white text-sm font-semibold">
                                                        Rate
                                                        &
                                                        Review
                                                    </Text>
                                                </TouchableOpacity>

                                            </View>
                                        )}

                                </View>
                            );
                        }
                    )}

                </View>

                {/* Shipping Details */}
                <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100">

                    <Text className="text-lg font-bold text-primary mb-2">
                        Shipping Details
                    </Text>

                    <View className="flex-row items-start">

                        <Ionicons
                            name="location-outline"
                            size={20}
                            color={COLORS.secondary}
                        />

                        <Text className="text-secondary ml-2 flex-1">
                            {
                                order
                                    .shippingAddress
                                    ?.street
                            }
                            ,{" "}
                            {
                                order
                                    .shippingAddress
                                    ?.city
                            }
                            ,{" "}
                            {
                                order
                                    .shippingAddress
                                    ?.zipCode
                            }
                            ,{" "}
                            {
                                order
                                    .shippingAddress
                                    ?.country
                            }
                        </Text>

                    </View>

                </View>

                {/* Payment Summary */}
                <View className="bg-white p-4 rounded-xl mb-8 border border-gray-100">

                    <Text className="text-lg font-bold text-primary mb-4">
                        Payment Summary
                    </Text>

                    <View className="flex-row justify-between mb-2">

                        <Text className="text-secondary">
                            Payment Method
                        </Text>

                        <Text className="text-primary font-medium capitalize">
                            {order.paymentMethod}
                        </Text>

                    </View>

                    <View className="flex-row justify-between mb-2">

                        <Text className="text-secondary">
                            Payment Status
                        </Text>

                        <Text
                            className={`font-medium capitalize ${
                                order.paymentStatus ===
                                "paid"
                                    ? "text-green-600"
                                    : order.paymentStatus ===
                                        "failed"
                                      ? "text-red-600"
                                      : "text-orange-500"
                            }`}
                        >
                            {order.paymentStatus}
                        </Text>

                    </View>

                    <View className="h-px bg-gray-100 my-2" />

                    <View className="flex-row justify-between mb-2">

                        <Text className="text-secondary">
                            Subtotal
                        </Text>

                        <Text className="text-primary font-medium">
                            Rs.
                            {order.subtotal.toFixed(
                                2
                            )}
                        </Text>

                    </View>

                    <View className="flex-row justify-between mb-2">

                        <Text className="text-secondary">
                            Shipping
                        </Text>

                        <Text className="text-primary font-medium">
                            Rs.
                            {order.shippingCost.toFixed(
                                2
                            )}
                        </Text>

                    </View>

                    <View className="flex-row justify-between mb-2">

                        <Text className="text-secondary">
                            Tax
                        </Text>

                        <Text className="text-primary font-medium">
                            Rs.
                            {order.tax.toFixed(2)}
                        </Text>

                    </View>

                    <View className="h-px bg-gray-100 my-2" />

                    <View className="flex-row justify-between">

                        <Text className="text-primary font-bold text-lg">
                            Total
                        </Text>

                        <Text className="text-primary font-bold text-lg">
                            Rs.
                            {order.totalAmount.toFixed(
                                2
                            )}
                        </Text>

                    </View>

                </View>
            </ScrollView>

            {/* Rating and Review Modal */}
            <Modal
                visible={ratingModalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={
                    closeRatingModal
                }
            >
                <View className="flex-1 justify-end">

                    <Pressable
                        onPress={closeRatingModal}
                        className="absolute inset-0 bg-black/50"
                    />

                    <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">

                        <View className="flex-row justify-between items-center">

                            <Text className="text-xl font-bold text-primary flex-1 mr-3">
                                Rate & Review
                                Product
                            </Text>

                            <TouchableOpacity
                                onPress={
                                    closeRatingModal
                                }
                                disabled={
                                    submittingRating
                                }
                                className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <Ionicons
                                    name="close"
                                    size={22}
                                    color={
                                        COLORS.primary
                                    }
                                />
                            </TouchableOpacity>

                        </View>

                        <Text
                            className="text-secondary mt-3"
                            numberOfLines={2}
                        >
                            {selectedProductName}
                        </Text>

                        <Text className="text-primary font-medium text-center mt-6">
                            How would you rate
                            this product?
                        </Text>

                        {loadingRating ? (
                            <View className="py-8">

                                <ActivityIndicator
                                    size="small"
                                    color={
                                        COLORS.primary
                                    }
                                />

                            </View>
                        ) : (
                            <>
                                <View className="flex-row justify-center mt-6">

                                    {[
                                        1,
                                        2,
                                        3,
                                        4,
                                        5
                                    ].map(
                                        (
                                            star
                                        ) => (
                                            <TouchableOpacity
                                                key={
                                                    star
                                                }
                                                onPress={() =>
                                                    setSelectedRating(
                                                        star
                                                    )
                                                }
                                                className="mx-1"
                                                activeOpacity={
                                                    0.7
                                                }
                                            >
                                                <Ionicons
                                                    name={
                                                        star <=
                                                        selectedRating
                                                            ? "star"
                                                            : "star-outline"
                                                    }
                                                    size={
                                                        40
                                                    }
                                                    color="#f5b301"
                                                />
                                            </TouchableOpacity>
                                        )
                                    )}

                                </View>

                                {selectedRating >
                                    0 && (
                                    <Text className="text-center text-secondary mt-4">
                                        You selected{" "}
                                        {
                                            selectedRating
                                        }{" "}
                                        out of 5
                                    </Text>
                                )}

                                <View className="mt-6">

                                    <Text className="text-primary font-semibold mb-2">
                                        Write your
                                        review
                                    </Text>

                                    <TextInput
                                        value={
                                            selectedReview
                                        }
                                        onChangeText={
                                            setSelectedReview
                                        }
                                        placeholder="Share your experience with this product..."
                                        placeholderTextColor={
                                            COLORS.secondary
                                        }
                                        multiline
                                        numberOfLines={
                                            4
                                        }
                                        maxLength={
                                            1000
                                        }
                                        textAlignVertical="top"
                                        editable={
                                            !submittingRating
                                        }
                                        className="min-h-28 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-primary"
                                    />

                                    <Text className="text-right text-gray-400 text-xs mt-2">
                                        {
                                            selectedReview.length
                                        }
                                        /1000
                                    </Text>

                                </View>

                                <View className="mt-5">

    <View className="flex-row items-center justify-between">

        <View className="flex-1 mr-3">

            <Text className="text-primary font-semibold">
                Add product photos
            </Text>

            <Text className="text-secondary text-xs mt-1">
                Optional, maximum 5 images
            </Text>

        </View>

        <Text className="text-secondary text-xs">
            {selectedReviewImages.length > 0
                ? selectedReviewImages.length
                : existingReviewImages.length}
            /5
        </Text>

    </View>

    {existingReviewImages.length > 0 &&
        selectedReviewImages.length === 0 && (
            <View className="mt-3">

                <Text className="text-secondary text-xs mb-2">
                    Previously uploaded images
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    {existingReviewImages.map(
                        (image, index) => (
                            <Image
                                key={
                                    image.publicId ||
                                    `${image.url}-${index}`
                                }
                                source={{
                                    uri: image.url
                                }}
                                className="w-20 h-20 rounded-xl bg-gray-100 mr-3"
                                resizeMode="cover"
                            />
                        )
                    )}
                </ScrollView>

                <Text className="text-orange-500 text-xs mt-2">
                    Selecting new images will replace these images.
                </Text>

            </View>
        )}

    {selectedReviewImages.length > 0 && (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
        >
            {selectedReviewImages.map(
                (image, index) => (
                    <View
                        key={`${image.uri}-${index}`}
                        className="mr-3"
                    >
                        <Image
                            source={{
                                uri: image.uri
                            }}
                            className="w-20 h-20 rounded-xl bg-gray-100"
                            resizeMode="cover"
                        />

                        <TouchableOpacity
                            onPress={() =>
                                removeSelectedReviewImage(
                                    index
                                )
                            }
                            disabled={
                                submittingRating
                            }
                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-black items-center justify-center"
                        >
                            <Ionicons
                                name="close"
                                size={17}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                )
            )}
        </ScrollView>
    )}

    <TouchableOpacity
        onPress={pickReviewImages}
        disabled={
            submittingRating ||
            selectedReviewImages.length >= 5
        }
        activeOpacity={0.8}
        className={`mt-4 border border-dashed rounded-xl py-4 items-center justify-center ${
            submittingRating ||
            selectedReviewImages.length >= 5
                ? "border-gray-200 bg-gray-100"
                : "border-gray-400 bg-gray-50"
        }`}
    >
        <Ionicons
            name="images-outline"
            size={25}
            color={
                selectedReviewImages.length >= 5
                    ? "#9ca3af"
                    : COLORS.primary
            }
        />

        <Text
            className={`font-semibold mt-2 ${
                selectedReviewImages.length >= 5
                    ? "text-gray-400"
                    : "text-primary"
            }`}
        >
            {existingReviewImages.length > 0 &&
            selectedReviewImages.length === 0
                ? "Replace Review Images"
                : selectedReviewImages.length > 0
                  ? "Add More Images"
                  : "Choose Images"}
        </Text>
    </TouchableOpacity>

</View>

                                <TouchableOpacity
                                    onPress={
                                        submitRating
                                    }
                                    disabled={
                                        submittingRating ||
                                        selectedRating ===
                                            0 ||
                                        selectedReview.trim()
                                            .length <
                                            3
                                    }
                                    className={`mt-6 py-4 rounded-xl items-center ${
                                        submittingRating ||
                                        selectedRating ===
                                            0 ||
                                        selectedReview.trim()
                                            .length <
                                            3
                                            ? "bg-gray-300"
                                            : "bg-black"
                                    }`}
                                >
                                    {submittingRating ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="white"
                                        />
                                    ) : (
                                        <Text className="text-white font-bold">
                                            Submit
                                            Rating &
                                            Review
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}