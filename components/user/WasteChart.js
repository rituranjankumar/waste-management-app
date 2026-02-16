"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const WasteTypeChart = ({ data, loading }) => {
 
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

   
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        No waste data available
      </div>
    );
  }

  
  const getRandomColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      colors.push(
        `rgb(${Math.floor(Math.random() * 256)}, 
              ${Math.floor(Math.random() * 256)}, 
              ${Math.floor(Math.random() * 256)})`
      );
    }
    return colors;
  };

  //   data for chart -> use memo for potimisation only recalculate teh data when data changes
  const chartData = useMemo(() => {
    return {
      labels: data.map((item) => item.type),
      datasets: [
        {
          label: "Reports",
          data: data.map((item) => item.count),
          backgroundColor: getRandomColors(data.length),
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  return (
    <div className="mx-auto h-64 max-w-md">
      <Pie data={chartData} />
    </div>
  );
};

export default WasteTypeChart;
