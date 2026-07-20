import React from 'react'
import {
  Text,
  TextProps,
  TextStyle,
} from 'react-native'

type AppTextWeight =
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'

interface AppTextProps extends TextProps {
  weight?: AppTextWeight
  className?: string
}

const fontFamilies: Record<
  AppTextWeight,
  TextStyle['fontFamily']
> = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
}

export default function AppText({
  weight = 'regular',
  className,
  style,
  children,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      className={className}
      style={[
        {
          fontFamily:
            fontFamilies[weight],
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}