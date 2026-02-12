import supabase from "../services/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import type { FavoritePayload, FavoriteRow } from "../types/movieTypes";

const getUserId = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return data.session.user.id;
};

export const addToFavorites = async (payload: FavoritePayload) => {
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from("favorites")
    .insert({
      user_id,
      movie_id: payload.movie_id,
      title: payload.title,
      poster_path: payload.poster_path,
      backdrop_path: payload.backdrop_path,
      media_type: payload.media_type,
    })
    .select()
    .maybeSingle();

  if (error) {
    throw error as PostgrestError;
  }

  return data;
};

export const deleteFromFavorites = async (movieId: number) => {
  const user_id = await getUserId();
  const { error } = await supabase.from("favorites").delete().eq("user_id", user_id).eq("movie_id", movieId);

  if (error) {
    throw error as PostgrestError;
  }

  return true;
};

export const checkIsFavorited = async (movieId: number) => {
  const user_id = await getUserId();
  const { data, error } = await supabase.from("favorites").select("id").eq("user_id", user_id).eq("movie_id", movieId).maybeSingle();

  if (error) {
    throw error as PostgrestError;
  }

  return Boolean(data);
};

export const fetchFavorites = async (userId: string) => {
  const { data, error } = await supabase.from("favorites").select("movie_id,title,poster_path,backdrop_path,created_at,media_type").eq("user_id", userId).order("created_at", { ascending: false });

  if (error) {
    throw error as PostgrestError;
  }

  return (data ?? []) as FavoriteRow[];
};
