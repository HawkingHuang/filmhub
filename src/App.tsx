import { createBrowserRouter, RouterProvider } from "react-router-dom";
import useAuthSessionSync from "./hooks/useAuthSessionSync";
import AppLayout from "./ui/AppLayout";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        lazy: () => import("./pages/Home/route"),
      },
      {
        path: "/search",
        lazy: () => import("./pages/Search/route"),
      },
      {
        path: "/genres/:id",
        lazy: () => import("./pages/Genre/route"),
      },
      {
        path: "/login",
        lazy: () => import("./pages/Login/route"),
      },
      {
        path: "/signup",
        lazy: () => import("./pages/Signup/route"),
      },
      {
        path: "/movies/:id",
        lazy: () => import("./pages/Movie/route"),
      },
      {
        path: "/tv/:id",
        lazy: () => import("./pages/Tv/route"),
      },
      {
        path: "/actors/:id",
        lazy: () => import("./pages/Actor/route"),
      },
      {
        path: "/user",
        lazy: () => import("./pages/User/route"),
      },
    ],
  },
]);

function App() {
  useAuthSessionSync();

  return <RouterProvider router={router} />;
}

export default App;
