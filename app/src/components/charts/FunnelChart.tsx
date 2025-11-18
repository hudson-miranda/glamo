export interface FunnelChartProps {
  data: {
    label: string;
    value: number;
    percentage: number;
  }[];
  height?: number;
  colors?: string[];
}

export function FunnelChart({
  data,
  height = 400,
  colors = ['#6366f1', '#8b5cf6', '#a78bfa'],
}: FunnelChartProps) {
  // Calculate max value for width scaling
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex flex-col gap-4 h-full justify-center">
        {data.map((item, index) => {
          const widthPercentage = (item.value / maxValue) * 100;
          const color = colors[index % colors.length];

          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className="relative flex items-center justify-center rounded-lg py-4 px-6 text-white font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: color,
                  width: `${widthPercentage}%`,
                  minWidth: '200px',
                }}
              >
                <span className="text-sm md:text-base">
                  {item.label}: {item.value} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
