import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LandingPage, ReviewPage, ViewPage } from "@/pages";
import { MainLayout } from "@/layouts";
import { CheckerProvider } from "@gitcoin/ui/checker";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CheckerProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="review/:chainId/:poolId" element={<ReviewPage />} />
            <Route path="view/application/:chainId/:poolId/:applicationId" element={<ViewPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </BrowserRouter>
    </CheckerProvider>
  </StrictMode>,
);
