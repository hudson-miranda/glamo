import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export interface SparklineChartProps {
  data: number[];
  height?: number;
  color?: string;
  type?: 'line' | 'area';
  showTooltip?: boolean;
}

export function SparklineChart({
  data,
  height = 60,
  color = '#6366f1',
  type = 'area',
  showTooltip = true,
}: SparklineChartProps) {
  const options: ApexOptions = {
    chart: {
      type,
      sparkline: {
        enabled: true,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      opacity: type === 'area' ? 0.3 : 1,
    },
    colors: [color],
    tooltip: {
      enabled: showTooltip,
      theme: 'light',
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function () {
            return '';
          },
        },
      },
    },
  };

  return <ReactApexChart options={options} series={[{ data }]} type={type} height={height} />;
}
