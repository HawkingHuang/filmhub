import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./components/routeGuards/ProtectedRoute";
import PublicOnlyRoute from "./components/routeGuards/PublicOnlyRoute";
import Actor from "./pages/Actor/Actor";
import Genre from "./pages/Genre/Genre";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Movie from "./pages/Movie/Movie";
import Tv from "./pages/Tv/Tv";
import Search from "./pages/Search/Search";
import Signup from "./pages/Signup/Signup";
import User from "./pages/User/User";
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
        element: <Home />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/genres/:id",
        element: <Genre />,
      },
      {
        path: "/login",
        element: (
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "/signup",
        element: (
          <PublicOnlyRoute>
            <Signup />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "/movies/:id",
        element: <Movie />,
      },
      {
        path: "/tv/:id",
        element: <Tv />,
      },
      {
        path: "/actors/:id",
        element: <Actor />,
      },
      {
        path: "/user",
        element: (
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        ),
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
