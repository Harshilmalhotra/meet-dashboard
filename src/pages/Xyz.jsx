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
    <div style={{ padding: "1.5rem", fontFamily: "Arial, sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>🎤 Live Transcripts</h2>
      <div style={{
        backgroundColor: "#fff",
        padding: "1rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        maxHeight: "250px",
        overflowY: "auto",
        marginBottom: "2rem"
      }}>
        {transcripts.map((t, i) => (
          <p key={i} style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: "#2563eb" }}>{t.speaker}:</strong> {t.text}
          </p>
        ))}
      </div>

      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>📋 Detected Tasks</h2>
      <div style={{
        backgroundColor: "#fff",
        padding: "1rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        maxHeight: "250px",
        overflowY: "auto"
      }}>
        {tasks.map((task, i) => (
          <div key={i} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
            <p><strong>Task:</strong> {task.task}</p>
            <p><strong>Assignee:</strong> {task.assignee}</p>
            <p><strong>Due:</strong> {task.due}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
