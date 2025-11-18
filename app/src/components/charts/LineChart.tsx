import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export interface LineChartProps {
  data: {
    name: string;
    data: number[];
  }[];
  categories: string[];
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  curved?: boolean;
  showDataLabels?: boolean;
}

export function LineChart({
  data,
  categories,
  height = 350,
  colors = ['#6366f1', '#10b981'],
  showLegend = true,
  showGrid = true,
  curved = true,
  showDataLabels = false,
}: LineChartProps) {
  const options: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors,
    dataLabels: {
      enabled: showDataLabels,
    },
    stroke: {
      curve: curved ? 'smooth' : 'straight',
      width: 2,
    },
    grid: {
      show: showGrid,
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

  return <ReactApexChart options={options} series={data} type="line" height={height} />;
}
