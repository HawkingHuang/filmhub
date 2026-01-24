import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Movie from "./pages/Movie/Movie";
import Actor from "./pages/Actor/Actor";
import User from "./pages/User/User";
import Genre from "./pages/Genre/Genre";
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
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/movies/:id",
        element: <Movie />,
      },
      {
        path: "/actors/:id",
        element: <Actor />,
      },
      {
        path: "/user",
        element: <User />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
