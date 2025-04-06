// FILE: /Users/psneves/dev/br-com-meusdesafios/MeusDesafios/components/ui/IconSymbol.tsx

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // --- ADD THESE LINES ---
  'chart.bar.fill': 'bar-chart',
  'person.2.fill': 'people',
  'person.crop.circle.fill': 'account-circle',
  // -----------------------
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight; // Note: weight is ignored by MaterialIcons
}) {
  const iconName = MAPPING[name];

  if (!iconName) {
    console.warn(`IconSymbol: No mapping found for SF Symbol name "${name}". Rendering default icon.`);
    // Optionally render a default fallback icon like 'help-outline'
    return <MaterialIcons name="help-outline" size={size} color={color} style={style} />;
  }

  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}