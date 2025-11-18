import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export interface HeatmapChartProps {
  data: {
    day: number; // 0-6 (Sunday-Saturday)
    hour: number; // 0-23
    count: number;
  }[];
  height?: number;
}

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function HeatmapChart({ data, height = 500 }: HeatmapChartProps) {
  // Transform data into ApexCharts heatmap format
  // Group by day, then create series for each day
  const seriesData: { name: string; data: { x: string; y: number }[] }[] = [];

  for (let day = 0; day < 7; day++) {
    const dayData: { x: string; y: number }[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const dataPoint = data.find((d) => d.day === day && d.hour === hour);
      dayData.push({
        x: `${hour}:00`,
        y: dataPoint?.count || 0,
      });
    }

    seriesData.push({
      name: dayNames[day],
      data: dayData,
    });
  }

  const options: ApexOptions = {
    chart: {
      type: 'heatmap',
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#6366f1'],
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 2,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              name: 'Nenhum',
              color: '#f3f4f6',
            },
            {
              from: 1,
              to: 2,
              name: 'Baixo',
              color: '#ddd6fe',
            },
            {
              from: 3,
              to: 5,
              name: 'Médio',
              color: '#a78bfa',
            },
            {
              from: 6,
              to: 10,
              name: 'Alto',
              color: '#7c3aed',
            },
            {
              from: 11,
              to: 999,
              name: 'Muito Alto',
              color: '#5b21b6',
            },
          ],
        },
      },
    },
    xaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '11px',
        },
        rotate: -45,
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
    tooltip: {
      theme: 'light',
      y: {
        formatter: function (val) {
          return `${val} agendamento${val !== 1 ? 's' : ''}`;
        },
      },
    },
  };

  return <ReactApexChart options={options} series={seriesData} type="heatmap" height={height} />;
}
