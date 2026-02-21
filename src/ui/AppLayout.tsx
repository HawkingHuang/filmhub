import { useEffect, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Background from "../components/Background/Background";
import Header from "../components/Header/Header";
import type { ToastPayload } from "../types/toastTypes";
import ScrollToTop from "./ScrollToTop";

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastContent, setToastContent] = useState<ToastPayload | null>(null);

  const toast = (location.state as { toast?: ToastPayload } | null)?.toast;

  useEffect(() => {
    if (!toast) return;

    navigate(location.pathname, { replace: true, state: null });

    queueMicrotask(() => {
      setToastContent(toast);
      setToastOpen(true);
    });
  }, [toast, location.pathname, navigate]);

  return (
    <>
      <Background />
      <div style={{ position: "relative", zIndex: 2 }}>
        {location.pathname !== "/login" && location.pathname !== "/signup" && <Header />}
        <main id="main-content">
          <Outlet />
        </main>
        <ScrollToTop />
      </div>
      {toastContent && (
        <Toast.Root className="toastRoot" open={toastOpen} onOpenChange={setToastOpen}>
          <Toast.Title className="toastTitle">{toastContent.title}</Toast.Title>
          {toastContent.description && <Toast.Description className="toastDescription">{toastContent.description}</Toast.Description>}
        </Toast.Root>
      )}
    </>
  );
}

export default AppLayout;
