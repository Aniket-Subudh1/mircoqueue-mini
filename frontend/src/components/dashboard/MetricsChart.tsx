import { useEffect, useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Card from '@/components/common/Card';
import { MetricDataPoint } from '@/types/metrics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricsChartProps {
  title: string;
  subtitle?: string;
  data: MetricDataPoint[];
  timeFormat?: 'hour' | 'day' | 'month';
  color?: string;
  loading?: boolean;
  height?: number;
  valueUnit?: string;
}

const MetricsChart = ({
  title,
  subtitle,
  data,
  timeFormat = 'hour',
  color = '#2e7d32',
  loading = false,
  height = 350,
  valueUnit = '',
}: MetricsChartProps) => {
  const theme = useTheme();
  const chartRef = useRef<ChartJS<'line'>>(null);
  
  // Format time based on selected format
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    
    switch (timeFormat) {
      case 'hour':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'month':
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };
  
  const labels = data.map((point) => formatTime(point.timestamp));
  const values = data.map((point) => point.value);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + (valueUnit ? ` ${valueUnit}` : '');
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(value: any) {
            return value + (valueUnit ? ` ${valueUnit}` : '');
          }
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };
  
  return (
    <Card
      title={title}
      subtitle={subtitle}
      loading={loading}
    >
      <Box sx={{ height: height, position: 'relative' }}>
        {data.length > 0 ? (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default MetricsChart;