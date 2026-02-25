import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Toast from "@radix-ui/react-toast";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "./store";
import "@radix-ui/themes/styles.css";
import "./assets/styles/global.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 1000 * 60 * 60,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 0,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toast.Provider swipeDirection="right">
        <Theme>
          <Provider store={store}>
            <App />
          </Provider>
        </Theme>
        <Toast.Viewport className="toastViewport" />
      </Toast.Provider>
    </QueryClientProvider>
  </StrictMode>,
);
