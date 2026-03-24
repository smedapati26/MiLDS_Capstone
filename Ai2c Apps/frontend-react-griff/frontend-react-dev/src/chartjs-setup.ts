import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register all chart types and plugins your app uses
ChartJS.register(
  ArcElement, // For Doughnut/Pie charts
  DoughnutController,
  BarElement, // For Bar charts
  BarController, // For Bar charts (controller)
  CategoryScale, // For categorical axes (x-axis in Bar charts)
  PointElement, // for the points of the line chart
  LineElement, // for line charts
  LinearScale, // For numeric axes (y-axis in Bar charts)
  LineController,
  annotationPlugin, // For annotation support
);
