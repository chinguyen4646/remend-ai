import { View } from "react-native";
import Svg, { Polyline, Circle } from "react-native-svg";

interface SparklineProps {
  data: number[]; // Array of values (e.g., pain scores 0-10)
  width?: number;
  height?: number;
  color?: string;
  highlightLast?: boolean;
}

/**
 * Simple sparkline chart for visualizing trends
 * Shows a line connecting data points with optional highlight on the last point
 */
export default function Sparkline({
  data,
  width = 300,
  height = 60,
  color = "#6366f1",
  highlightLast = true,
}: SparklineProps) {
  if (data.length === 0) {
    return <View style={{ width, height }} />;
  }

  // Calculate min/max for scaling
  const maxValue = Math.max(...data, 10); // Ensure at least 10 for scale
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  // Calculate points for the polyline
  const padding = 10;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * availableWidth;
      const y = padding + availableHeight - ((value - minValue) / range) * availableHeight;
      return `${x},${y}`;
    })
    .join(" ");

  // Last point coordinates for highlight
  const lastIndex = data.length - 1;
  const lastX = padding + (lastIndex / (data.length - 1 || 1)) * availableWidth;
  const lastY =
    padding + availableHeight - ((data[lastIndex] - minValue) / range) * availableHeight;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* Line connecting all points */}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Highlight last point (today) */}
        {highlightLast && data.length > 0 && <Circle cx={lastX} cy={lastY} r="4" fill={color} />}
      </Svg>
    </View>
  );
}
