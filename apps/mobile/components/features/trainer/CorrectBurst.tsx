import { useEffect, useRef, useState } from "react";
import { Animated, useWindowDimensions, View } from "react-native";

const BURST_COLORS = ["#4ade80", "#facc15", "#60a5fa", "#f472b6", "#a78bfa"];
const BURST_COUNT = 14;

type ParticleConfig = {
  startX: number;
  endY: number;
  color: string;
  size: number;
  delay: number;
};

function BurstParticle({
  cfg,
  trigger,
}: {
  cfg: ParticleConfig;
  trigger: number;
}) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === 0) return;
    x.setValue(0);
    y.setValue(0);
    opacity.setValue(0);
    scale.setValue(0);

    Animated.sequence([
      Animated.delay(cfg.delay),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.delay(300),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scale, {
          toValue: 1,
          damping: 6,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(x, {
          toValue: cfg.startX,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: cfg.endY,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [trigger, cfg, x, y, opacity, scale]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: cfg.size,
        height: cfg.size,
        borderRadius: cfg.size / 2,
        backgroundColor: cfg.color,
        left: -cfg.size / 2,
        top: -cfg.size / 2,
        opacity,
        transform: [{ translateX: x }, { translateY: y }, { scale }],
      }}
    />
  );
}

export function CorrectBurst({ active }: { active: boolean }) {
  const { width } = useWindowDimensions();
  const triggerCount = useRef(0);
  const configs = useRef<ParticleConfig[]>(
    Array.from({ length: BURST_COUNT }, (_, i) => ({
      startX: (Math.random() - 0.5) * width * 0.85,
      endY: -(120 + Math.random() * 160),
      color: BURST_COLORS[i % BURST_COLORS.length],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 200,
    })),
  ).current;
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (active) {
      triggerCount.current += 1;
      setTrigger(triggerCount.current);
    }
  }, [active]);

  if (!active) return null;

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", bottom: 0, left: width / 2, height: 0 }}
    >
      {configs.map((cfg, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: particle configs are stable per mount
        <BurstParticle key={i} cfg={cfg} trigger={trigger} />
      ))}
    </View>
  );
}
