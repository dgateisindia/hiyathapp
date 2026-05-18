import { COLORS } from '@/constants'
import { HeaderProps } from '@/constants/types'
import useCart from '@/context/CartContext'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

export default function Header({title, showBack, showSearch,
  showCart, showMenu, showLogo} : HeaderProps) {

    const router = useRouter()
    const { itemCount } = useCart()
    //const itemCount = cartItems.length


  return (
    <View className='flex-row items-center justify-between
    px-4 py-3 bg-white'>

      {/*left side*/}
      <View className='flex-row items-center flex-1'>
      {showBack && (
        <TouchableOpacity onPress={ () => router.back()}
        className='mr-3'>
      <Ionicons name='arrow-back' size={24} color={COLORS.primary

      }/>

        </TouchableOpacity>
  )}

    {/* {showMenu && (
      <TouchableOpacity  className='mr-3'>
        <Ionicons name='menu-outline' size={24} color={COLORS.primary} />
      </TouchableOpacity>
    )} */}

    {showLogo ? (
        <View className='flex-1'>
            <Image source={require('@/assets/hyath.avif')}
            style = {{ width:"100%", height: 24}} resizeMode='contain'/>
        </View>
    ): title &&(
        <Text className='text-x1 font-bold text-primary text-center flex-1 mr-8'
        >{title}</Text>
    )}

    {(!title && !showSearch) && <View className='flex-1'/>}
      </View>
        {/*right side*/}
       <View className='flex-row items-center gap-4'>
        {showSearch && (
          <TouchableOpacity>
            <Ionicons name='search-outline' size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity
             onPress={() => router.push('/(tabs)/cart')}
            >
    <View className='relative'>

      <Ionicons
        name='bag-outline'
        size={24}
        color={COLORS.primary}
      />

      {itemCount > 0 && (
        <View
          className='absolute -top-2 -right-2
          bg-red-500 min-w-[18px] h-[18px]
          rounded-full items-center justify-center px-1'
        >
          <Text className='text-white text-[10px] font-bold'>
            {itemCount}
          </Text>
        </View>
      )}

    </View>
  </TouchableOpacity>
)}
        
       </View>
      
      
    </View>
  )
}