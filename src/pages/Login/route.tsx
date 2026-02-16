import PublicOnlyRoute from "../../components/routeGuards/PublicOnlyRoute";
import Login from "./Login";

export function Component() {
  return (
    <PublicOnlyRoute>
      <Login />
    </PublicOnlyRoute>
  );
}
