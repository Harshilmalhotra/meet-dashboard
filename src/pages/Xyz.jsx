// src/components/LiveDashboard.jsx
import { useEffect, useState } from "react";

export default function LiveDashboard() {
  const [transcripts, setTranscripts] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // const socket = new WebSocket("ws://localhost:4000");
    const socket = new WebSocket("wss://60e9-103-4-221-252.ngrok-free.app");

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "transcript") {
        setTranscripts(prev => [...prev, message.data]);
      } else if (message.type === "task") {
        setTasks(prev => [...prev, message.data]);
      }
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">🎤 Live Transcripts</h2>
      <div className="bg-white p-4 rounded-lg shadow space-y-2 max-h-64 overflow-auto">
        {transcripts.map((t, i) => (
          <p key={i}><strong>{t.speaker}:</strong> {t.text}</p>
        ))}
      </div>

      <h2 className="text-xl font-bold">📋 Detected Tasks</h2>
      <div className="bg-white p-4 rounded-lg shadow space-y-2 max-h-64 overflow-auto">
        {tasks.map((task, i) => (
          <div key={i} className="border-b pb-2">
            <p><strong>Task:</strong> {task.task}</p>
            <p><strong>Assignee:</strong> {task.assignee}</p>
            <p><strong>Due:</strong> {task.due}</p>
          </div>
        ))}
      </div>
    </div>
  );
}