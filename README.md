# Film Center

A modern movie discovery app built with React, TypeScript, and Vite. It integrates TMDB for movie data, Supabase for authentication and favorites, and OMDb (optional) for IMDb ratings.

## Key Features

- Supabase email/password authentication with protected routes and session persistence.
- Movie and TV discovery via TMDB, with trending rows, genre browsing, and search.
- Rich detail pages with trailers, cast, recommendations, and “read more” dialogs.
- Favorites stored in Supabase and recently viewed movies stored in local storage.
- Responsive layout with SCSS modules and shared mixins.
- UI components powered by Radix UI and Swiper.

## Pages

- **Home**: movie/TV toggle (via ?type=movie|tv) with genre rows and trending carousel.
- **Search**: multi-search for movies and people with pagination.
- **Genres**: browse movies or TV by genre with pagination and a genre selector.
- **Movie Detail**: poster, overview dialog, trailer, credits, recommendations, and favorite toggling.
- **TV Detail**: TV series detail page with trailer, credits, recommendations, and favorite toggling.
- **Actor Detail**: biography dialog, credits list, year filtering, and search within credits.
- **User** (protected): favorites and recently viewed tabs.
- **Login / Signup**: Supabase authentication flows.

## Tech Stack

- React + TypeScript + Vite
- React Router, Redux Toolkit
- TanStack Query for data fetching and caching
- Supabase for auth and favorites storage
- Radix UI (Toast, Dialog, Themes) and Swiper
- SCSS modules with shared mixins

## Environment Variables

Create a .env file in the project root:

- TMDB_API_KEY (required)
- OMDB_API_KEY (optional, enables IMDb ratings)
- VITE_SUPABASE_URL (required)
- VITE_SUPABASE_KEY (required)

## Getting Started

1. Install dependencies.
2. Add environment variables.
3. Run the dev server.

## Scripts

- dev: start Vite dev server
- build: type-check and build
- lint: run ESLint
- preview: preview the production build

## Data Notes

- Favorites are stored in Supabase in a favorites table with movie/TV metadata and user ownership.
- Recently viewed movies are stored in local storage for quick access in the User page.
