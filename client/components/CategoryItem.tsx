import AppText from '@/components/AppText'
import { COLORS } from '@/constants'
import { CategoryItemProps } from '@/constants/types'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import {
  TouchableOpacity,
  View,
} from 'react-native'

export default function CategoryItem({
  item,
  isSelected,
  onPress,
}: CategoryItemProps) {
  return (
    <TouchableOpacity
      className="mr-4 items-center"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        className={`mb-2 h-14 w-14 items-center justify-center rounded-lg border ${
          isSelected
            ? 'border-primary bg-primary'
            : 'border-border bg-surface'
        }`}
      >
        <Ionicons
          name={item.icon as any}
          size={24}
          color={
            isSelected
              ? '#FFFFFF'
              : COLORS.primary
          }
        />
      </View>

      <AppText
        weight="medium"
        className={`text-xs ${
          isSelected
            ? 'text-primary'
            : 'text-secondary'
        }`}
      >
        {item.name}
      </AppText>
    </TouchableOpacity>
  )
}