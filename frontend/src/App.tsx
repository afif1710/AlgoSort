import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Topics from "./pages/Topics";
import TopicPage from "./pages/TopicPage";
import Problems from "./pages/Problems";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutorials" element={<Topics />} />{" "}
          {/* ✅ Changed from /topics */}
          <Route path="/tutorials/:slug" element={<TopicPage />} />{" "}
          {/* ✅ Changed from /topics/:slug */}
          <Route path="/problems" element={<Problems />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
