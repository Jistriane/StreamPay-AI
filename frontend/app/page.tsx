"use client";
import React, { useState, useEffect } from "react";
import Chat from "./components/Chat";

export default function StreamPayDashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="chat-page">
      <Chat />
    </div>
  );
}
