import { useEffect } from "react";
import { useDispatch } from "react-redux";
import supabase from "../services/supabase";
import { clearSession, setSession } from "../store/authSlice";
import type { AppDispatch } from "../store";

function useAuthSessionSync() {
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
}

export default useAuthSessionSync;
