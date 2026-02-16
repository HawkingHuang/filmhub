import ProtectedRoute from "../../components/routeGuards/ProtectedRoute";
import User from "./User";

export function Component() {
  return (
    <ProtectedRoute>
      <User />
    </ProtectedRoute>
  );
}
