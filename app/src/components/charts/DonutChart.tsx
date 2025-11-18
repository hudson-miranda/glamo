import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export interface DonutChartProps {
  data: number[];
  labels: string[];
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showDataLabels?: boolean;
  donutSize?: string;
}

export function DonutChart({
  data,
  labels,
  height = 350,
  colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  showLegend = true,
  showDataLabels = true,
  donutSize = '70%',
}: DonutChartProps) {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
    },
    colors,
    labels,
    dataLabels: {
      enabled: showDataLabels,
    },
    legend: {
      show: showLegend,
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: donutSize,
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: function (w) {
                return w.globals.seriesTotals
                  .reduce((a: number, b: number) => a + b, 0)
                  .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
              },
            },
          },
        },
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: function (val) {
          return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        },
      },
    },
  };

  return <ReactApexChart options={options} series={data} type="donut" height={height} />;
}
