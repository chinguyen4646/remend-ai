/**
 * WeeklyTrendChart: 7-day line chart for pain and stiffness trends
 *
 * Features:
 * - Shows last 7 calendar days (with gaps for missed logs)
 * - Two lines: pain (blue) and stiffness (orange)
 * - X-axis: Day labels (Mon, Tue, Wed...)
 * - Y-axis: 0-10 scale
 * - Hollow grey circles for days with no data
 */

import React from "react";
import { View, Text } from "react-native";
import Svg, { Line, Circle, Polyline, Text as SvgText } from "react-native-svg";

interface ChartDataPoint {
  date: string;
  dayLabel: string;
  pain: number | null;
  stiffness: number | null;
}

interface WeeklyTrendChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
}

export default function WeeklyTrendChart({
  data,
  width = 320,
  height = 120,
}: WeeklyTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={{ width, height }} className="items-center justify-center bg-gray-50 rounded">
        <Text className="text-gray-500 text-sm">No data available</Text>
      </View>
    );
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index: number) => padding.left + (index * chartWidth) / (data.length - 1);
  const yScale = (value: number) => padding.top + chartHeight - (value / 10) * chartHeight;

  // Build pain line points
  const painPoints: Array<{ x: number; y: number }> = [];
  const stiffnessPoints: Array<{ x: number; y: number }> = [];

  data.forEach((point, index) => {
    const x = xScale(index);
    if (point.pain !== null) {
      painPoints.push({ x, y: yScale(point.pain) });
    }
    if (point.stiffness !== null) {
      stiffnessPoints.push({ x, y: yScale(point.stiffness) });
    }
  });

  // Convert points to polyline format
  const painPolyline = painPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const stiffnessPolyline = stiffnessPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* Y-axis grid lines */}
        {[0, 2, 4, 6, 8, 10].map((value) => {
          const y = yScale(value);
          return (
            <Line
              key={`grid-${value}`}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* X-axis */}
        <Line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#9ca3af"
          strokeWidth="1"
        />

        {/* Y-axis */}
        <Line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#9ca3af"
          strokeWidth="1"
        />

        {/* Pain line (blue) */}
        {painPoints.length > 1 && (
          <Polyline
            points={painPolyline}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {/* Stiffness line (orange) */}
        {stiffnessPoints.length > 1 && (
          <Polyline
            points={stiffnessPolyline}
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {data.map((point, index) => {
          const x = xScale(index);
          const hasPain = point.pain !== null;
          const hasStiffness = point.stiffness !== null;

          return (
            <React.Fragment key={`point-${index}`}>
              {/* Pain point */}
              {hasPain ? (
                <Circle cx={x} cy={yScale(point.pain!)} r="4" fill="#3b82f6" />
              ) : (
                <Circle cx={x} cy={yScale(5)} r="3" fill="none" stroke="#d1d5db" strokeWidth="1" />
              )}

              {/* Stiffness point */}
              {hasStiffness && <Circle cx={x} cy={yScale(point.stiffness!)} r="4" fill="#f97316" />}

              {/* Day label */}
              <SvgText
                x={x}
                y={height - padding.bottom + 15}
                fontSize="10"
                fill="#6b7280"
                textAnchor="middle"
              >
                {point.dayLabel}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Y-axis labels */}
        {[0, 5, 10].map((value) => {
          const y = yScale(value);
          return (
            <SvgText
              key={`y-label-${value}`}
              x={padding.left - 10}
              y={y + 4}
              fontSize="10"
              fill="#6b7280"
              textAnchor="end"
            >
              {value}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      <View className="flex-row justify-center gap-4 mt-2">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-blue-500" />
          <Text className="text-xs text-gray-600">Pain</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-orange-500" />
          <Text className="text-xs text-gray-600">Stiffness</Text>
        </View>
      </View>
    </View>
  );
}
