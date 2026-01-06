import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import TopicCreatePage from "../pages/TopicCreatePage";
import TopicConstraintsPage from "../pages/TopicConstraintsPage";
import TopicMainPage from "../pages/TopicMainPage";
import TopicAdminPage from "../pages/TopicAdminPage";
import TelegramEntryPage from "../pages/TelegramEntryPage";

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/tg" element={<TelegramEntryPage />} />
    <Route path="/" element={<LandingPage />} />
    <Route path="/topic/new" element={<TopicCreatePage />} />
    <Route path="/topic/new/constraints" element={<TopicConstraintsPage />} />
    <Route path="/topic/:topicId" element={<TopicMainPage />} />
    <Route path="/topic/:topicId/admin" element={<TopicAdminPage />} />
  </Routes>
);

export default AppRoutes;
