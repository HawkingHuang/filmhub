import PublicOnlyRoute from "../../components/routeGuards/PublicOnlyRoute";
import Signup from "./Signup";

export function Component() {
  return (
    <PublicOnlyRoute>
      <Signup />
    </PublicOnlyRoute>
  );
}
