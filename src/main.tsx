import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LandingPage, ReviewPage, ViewPage } from "@/pages";
import { MainLayout } from "@/layouts";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<MainLayout />}>
          <Route path="review/:chainId/:poolId" element={<ReviewPage />} />
          <Route path="view/:chainId/:poolId/:applicationId" element={<ViewPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace={true} />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
