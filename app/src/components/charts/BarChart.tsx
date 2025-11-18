import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export interface BarChartProps {
  data: {
    name: string;
    data: number[];
  }[];
  categories: string[];
  height?: number;
  colors?: string[];
  horizontal?: boolean;
  stacked?: boolean;
  showLegend?: boolean;
  showDataLabels?: boolean;
}

export function BarChart({
  data,
  categories,
  height = 350,
  colors = ['#6366f1', '#10b981'],
  horizontal = false,
  stacked = false,
  showLegend = true,
  showDataLabels = false,
}: BarChartProps) {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
      stacked,
    },
    colors,
    plotOptions: {
      bar: {
        horizontal,
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: showDataLabels,
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    legend: {
      show: showLegend,
      position: 'top',
      horizontalAlign: 'right',
    },
    tooltip: {
      theme: 'light',
    },
  };

  return <ReactApexChart options={options} series={data} type="bar" height={height} />;
}
