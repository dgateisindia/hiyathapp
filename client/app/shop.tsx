import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { COLORS } from '@/constants';
import api from '@/constants/api';
import { Product } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SortOrder = 'default' | 'lowToHigh' | 'highToLow';

export default function Shop() {

    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);

    const [search, setSearch] = React.useState('');

    // Filter states
    const [showFilterModal, setShowFilterModal] =
        React.useState(false);

    const [sortOrder, setSortOrder] =
        React.useState<SortOrder>('default');

    // Fetch Products
    const fetchProducts = async (
    pageNumber = 1,
    selectedSort: SortOrder = sortOrder
) => {

    if (pageNumber === 1) {
        setLoading(true);
    } else {
        setLoadingMore(true);
    }

    try {

        const { data } = await api.get('/products', {
            params: {
                page: pageNumber,
                limit: 10,
                sort: selectedSort
            }
        });

        if (pageNumber === 1) {

            setProducts(data.data);

        } else {

            setProducts((prev) => {

                const merged = [
                    ...prev,
                    ...data.data
                ];

                return merged.filter(
                    (item, index, self) =>
                        index === self.findIndex(
                            product =>
                                product._id === item._id
                        )
                );

            });

        }

        setHasMore(
            data.pagination.page <
            data.pagination.pages
        );

        setPage(pageNumber);

    } catch (error) {

        console.log(
            'Fetch products error:',
            error
        );

    } finally {

        setLoading(false);
        setLoadingMore(false);

    }
};
    // Initial Load
    useEffect(() => {
        fetchProducts(1);
    }, []);

    // Search with Debounce
    useEffect(() => {

        const timer = setTimeout(async () => {

            if (search.trim() === '') {
                fetchProducts(1);
                return;
            }

            try {

                const { data } = await api.get(
                    '/products/search',
                    {
                        params: {
                            q: search,
                            sort: sortOrder
                        },
                    }
                );

                setProducts(data.data);
                setHasMore(false);

            } catch (error) {

                console.log(error);

            }

        }, 500);

        return () => clearTimeout(timer);

    }, [search]);

    

    // Pagination
    const loadMore = () => {

    if (search.trim() !== '') return;

    if (
        !loadingMore &&
        !loading &&
        hasMore
    ) {
        fetchProducts(
            page + 1,
            sortOrder
        );
    }
};

    const selectSortOrder = async (
    order: SortOrder
) => {

    setSortOrder(order);
    setShowFilterModal(false);
    setPage(1);
    setHasMore(true);

    if (search.trim() !== '') {

        setLoading(true);

        try {

            const { data } = await api.get(
                '/products/search',
                {
                    params: {
                        q: search,
                        sort: order
                    }
                }
            );

            setProducts(data.data);
            setHasMore(false);

        } catch (error) {

            console.log(
                'Search sorting error:',
                error
            );

        } finally {

            setLoading(false);

        }

        return;
    }

    fetchProducts(1, order);
};

    return (

        <SafeAreaView
            className="flex-1 bg-surface"
            edges={['top']}
        >

            <Header
                title="Shop"
                showBack
                showCart
            />

            {/* Search and Filter */}
            <View className="flex-row gap-2 mb-3 mx-4 my-2">

                <View className="flex-1 flex-row items-center bg-white rounded-xl border border-gray-100">

                    <Ionicons
                        name="search"
                        className="ml-4"
                        size={20}
                        color={COLORS.secondary}
                    />

                    <TextInput
                        className="flex-1 ml-2 text-primary px-4 py-3"
                        placeholder="Search Products..."
                        placeholderTextColor={COLORS.secondary}
                        returnKeyType="search"
                        value={search}
                        onChangeText={setSearch}
                    />

                </View>

                {/* Filter Button */}
                <TouchableOpacity
                    onPress={() => setShowFilterModal(true)}
                    className={`w-12 h-12 items-center justify-center rounded-xl ${
                        sortOrder !== 'default'
                            ? 'bg-black'
                            : 'bg-gray-800'
                    }`}
                >
                    <Ionicons
                        name="options-outline"
                        size={20}
                        color="white"
                    />
                </TouchableOpacity>

            </View>

            {loading ? (

                <View className="flex-1 justify-center items-center">

                    <ActivityIndicator
                        size="large"
                        color={COLORS.primary}
                    />

                </View>

            ) : (

                <FlatList
                    data={products}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={{
                        padding: 16,
                        paddingBottom: 100,
                    }}
                    columnWrapperStyle={{
                        justifyContent: 'space-between',
                    }}
                    renderItem={({ item }) => (
                        <ProductCard product={item} />
                    )}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <View className="py-4">

                                <ActivityIndicator
                                    size="small"
                                    color={COLORS.primary}
                                />

                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View className="items-center py-20">

                            <Text className="text-secondary">
                                No Products Found
                            </Text>

                        </View>
                    }
                />

            )}

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() =>
                    setShowFilterModal(false)
                }
            >

                <View className="flex-1 justify-end">

                    {/* Dark Background */}
                    <Pressable
                        onPress={() =>
                            setShowFilterModal(false)
                        }
                        className="absolute inset-0 bg-black/40"
                    />

                    {/* Bottom Filter Box */}
                    <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">

                        <View className="flex-row items-center justify-between mb-4">

                            <Text className="text-xl font-bold text-black">
                                Sort Products
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    setShowFilterModal(false)
                                }
                                className="w-9 h-9 items-center justify-center rounded-full bg-gray-100"
                            >
                                <Ionicons
                                    name="close"
                                    size={22}
                                    color={COLORS.primary}
                                />
                            </TouchableOpacity>

                        </View>

                        {/* Default */}
                        <TouchableOpacity
                            onPress={() =>
                                selectSortOrder('default')
                            }
                            className="flex-row items-center justify-between py-4 border-b border-gray-200"
                        >

                            <Text
                                className={`text-base ${
                                    sortOrder === 'default'
                                        ? 'font-bold text-black'
                                        : 'text-gray-600'
                                }`}
                            >
                                Default
                            </Text>

                            <Ionicons
                                name={
                                    sortOrder === 'default'
                                        ? 'radio-button-on'
                                        : 'radio-button-off'
                                }
                                size={23}
                                color={
                                    sortOrder === 'default'
                                        ? COLORS.primary
                                        : COLORS.secondary
                                }
                            />

                        </TouchableOpacity>

                        {/* Low to High */}
                        <TouchableOpacity
                            onPress={() =>
                                selectSortOrder('lowToHigh')
                            }
                            className="flex-row items-center justify-between py-4 border-b border-gray-200"
                        >

                            <View>

                                <Text
                                    className={`text-base ${
                                        sortOrder === 'lowToHigh'
                                            ? 'font-bold text-black'
                                            : 'text-gray-600'
                                    }`}
                                >
                                    Price: Low to High
                                </Text>

                                <Text className="text-xs text-gray-400 mt-1">
                                    Budget-Friendly First
                                </Text>

                            </View>

                            <Ionicons
                                name={
                                    sortOrder === 'lowToHigh'
                                        ? 'radio-button-on'
                                        : 'radio-button-off'
                                }
                                size={23}
                                color={
                                    sortOrder === 'lowToHigh'
                                        ? COLORS.primary
                                        : COLORS.secondary
                                }
                            />

                        </TouchableOpacity>

                        {/* High to Low */}
                        <TouchableOpacity
                            onPress={() =>
                                selectSortOrder('highToLow')
                            }
                            className="flex-row items-center justify-between py-4"
                        >

                            <View>

                                <Text
                                    className={`text-base ${
                                        sortOrder === 'highToLow'
                                            ? 'font-bold text-black'
                                            : 'text-gray-600'
                                    }`}
                                >
                                    Price: High to Low
                                </Text>

                                <Text className="text-xs text-gray-400 mt-1">
                                    Premium Products First
                                </Text>

                            </View>

                            <Ionicons
                                name={
                                    sortOrder === 'highToLow'
                                        ? 'radio-button-on'
                                        : 'radio-button-off'
                                }
                                size={23}
                                color={
                                    sortOrder === 'highToLow'
                                        ? COLORS.primary
                                        : COLORS.secondary
                                }
                            />

                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

        </SafeAreaView>

    );
}