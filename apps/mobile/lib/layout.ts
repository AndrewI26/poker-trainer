import { Platform, useWindowDimensions } from "react-native";

export const WEB_MAX_WIDTH = 430;

export function useAppDimensions() {
  const dimensions = useWindowDimensions();
  if (Platform.OS !== "web") return dimensions;
  return { ...dimensions, width: Math.min(dimensions.width, WEB_MAX_WIDTH) };
}
