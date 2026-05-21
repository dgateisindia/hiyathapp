import { COLORS } from '@/constants'
import useCart from '@/context/CartContext'
import { Feather, Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

export default function TabLayout() {

    const { itemCount } = useCart()

  return (
    <Tabs
    screenOptions={{
        headerShown:false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#CDCDE0',
        tabBarShowLabel: false,
        tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            height: 56,
            paddingTop: 8
        }
    }}
    >
        <Tabs.Screen name='index' options={{
            tabBarIcon:({color, focused}) => <Ionicons name=
            {focused ? 'home' : 'home-outline'} size={26} 
            color={color}/>
        }}/>

        <Tabs.Screen name='cart' options={{
            tabBarIcon:({color, focused}) =>
                 (
                <View className='relative'>
                    <Feather name=
            {focused ? 'shopping-cart' : 'shopping-cart'} size={26} 
            color={color}/>
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
            )
        }}/>

        <Tabs.Screen name='favorites' options={{
            tabBarIcon:({color, focused}) => <Ionicons name=
            {focused ? 'heart' : 'heart-outline'} size={26} 
            color={color}/>
        }}/>

        <Tabs.Screen name='profile' options={{
            tabBarIcon:({color, focused}) => <Ionicons name=
            {focused ? 'person' : 'person-outline'} size={26} 
            color={color}/>
        }}/>
    </Tabs>
  )
}