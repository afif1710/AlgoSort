// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Topics from "./pages/Topics";
import TopicPage from "./pages/TopicPage";
import Problems from "./pages/Problems";
import Math from "./pages/Math";
import MathTopicPage from "./pages/MathTopicPage";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutorials" element={<Topics />} />
          <Route path="/tutorials/:slug" element={<TopicPage />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/math" element={<Math />} />
          <Route path="/math/:slug" element={<MathTopicPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
