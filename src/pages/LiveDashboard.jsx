import { useEffect, useState } from "react";
import { FiWifi, FiWifiOff } from "react-icons/fi"; // WebSocket icons

const COLORS = [
  "text-blue-500",
  "text-green-500",
  "text-purple-500",
  "text-pink-500",
  "text-yellow-500",
  "text-red-500",
];

export default function LiveDashboard() {
  const [transcripts, setTranscripts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("wss://60e9-103-4-221-252.ngrok-free.app");

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setSocketConnected(true);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "transcript") {
        setTranscripts((prev) => [...prev, message.data]);
      } else if (message.type === "task") {
        setTasks((prev) => [...prev, message.data]);
      }
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setSocketConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen relative">
      {/* WebSocket Status Icon */}
      <div className="absolute top-6 right-6 group">
        {socketConnected ? (
          <FiWifi className="text-green-500 w-6 h-6 cursor-pointer" title="WebSocket Connected" />
        ) : (
          <FiWifiOff className="text-red-500 w-6 h-6 cursor-pointer" title="WebSocket Disconnected" />
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl font-bold mb-6 text-center">🎤 Live Dashboard</h2>

        {/* Two Columns */}
        <div className="flex gap-6">
          {/* Transcription Box (larger) */}
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-md max-h-[75vh] overflow-y-auto space-y-4">
            <h3 className="text-2xl font-bold mb-4">Transcripts</h3>
            {transcripts.map((t, i) => (
              <p key={i} className="text-gray-700">
                <span className={`${COLORS[i % COLORS.length]} font-semibold`}>{t.speaker}:</span> {t.text}
              </p>
            ))}
          </div>

          {/* Tasks Box (smaller) */}
          <div className="w-[350px] bg-white p-6 rounded-2xl shadow-md max-h-[75vh] overflow-y-auto space-y-4">
            <h3 className="text-2xl font-bold mb-4">Tasks</h3>
            {tasks.map((task, i) => (
              <div key={i} className="border-b last:border-none pb-3">
                <p><span className="font-semibold">Task:</span> {task.task}</p>
                <p><span className="font-semibold">Assignee:</span> {task.assignee}</p>
                <p><span className="font-semibold">Due:</span> {task.due}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
