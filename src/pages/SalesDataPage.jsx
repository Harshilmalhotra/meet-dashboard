import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesDataPage = () => {
  const [salesData, setSalesData] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "sales") {
        setSalesData(msg.data);
      }
    };

    return () => ws.close();
  }, []);

  const chartData = {
    labels: salesData.map((data) => data.time), // Assuming time is in the sales data
    datasets: [
      {
        label: "Sales Over Time",
        data: salesData.map((data) => data.salesAmount), // Assuming salesAmount is in the sales data
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Sales Data Visualization</h1>
      <div className="w-full max-w-4xl bg-white p-6 shadow-md rounded-lg">
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default SalesDataPage;
