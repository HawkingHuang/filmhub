import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import supabase from "./services/supabase";
import { clearSession, setSession } from "./store/authSlice";
import type { AppDispatch } from "./store";
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
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (data.session) {
        dispatch(setSession(data.session));
      } else {
        dispatch(clearSession());
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(setSession(session));
      } else {
        dispatch(clearSession());
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
