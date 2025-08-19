# Stream Track

**Track What You Watch. Love What You Watch. Never Forget a Single Show.**

Stream Track is a modern web application for tracking movies and TV shows you’ve watched, are watching, or want to watch. It features AI-powered recommendations, beautiful UI, and seamless authentication with Firebase.

## Features

- **User Authentication:** Sign up and log in with Firebase Auth.
- **Personal Lists:** Manage your Watchlist, Watching, and Watched lists for movies and TV shows.
- **AI Recommendations:** Get personalized recommendations based on your viewing history using Genkit AI.
- **Movie & TV Data:** Powered by [The Movie Database (TMDb)](https://www.themoviedb.org/) API.
- **Responsive UI:** Built with Next.js, Tailwind CSS, and Radix UI components.
- **Search:** Quickly find movies and TV shows to add to your lists.
- **Persistent Storage:** User data is stored in Firestore for authenticated users, and in localStorage for guests.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Radix UI
- **Backend/AI:** Genkit AI for recommendations
- **Auth & Database:** Firebase Auth & Firestore
- **APIs:** TMDb for movie/TV metadata

## Getting Started

1. **Clone the repository:**
	```sh
	git clone https://github.com/nitai-satapathy/Stream-Track.git
	cd Stream-Track
	```

2. **Install dependencies:**
	```sh
	npm install
	```

3. **Set up environment variables:**
	- Copy `.env.example` to `.env.local` and fill in your Firebase and TMDb API keys.

4. **Run the development server:**
	```sh
	npm run dev
	```
	The app will be available at [http://localhost:9002](http://localhost:9002).

## Project Structure

- `src/app/` — Next.js app pages (home, login, signup, search, etc.)
- `src/components/` — Reusable UI components (Header, MovieCard, MovieRow, etc.)
- `src/lib/` — API clients, Firebase, Firestore, TMDb logic, and utility types
- `src/ai/` — AI flows and Genkit integration for recommendations
- `src/hooks/` — Custom React hooks (authentication, toast notifications)
- `public/` — Static assets (icons, images)

## Customization

- **Firebase:** Update `src/lib/firebase.ts` with your Firebase project config.
- **TMDb:** Set your TMDb API key in the environment variables.
- **AI:** The recommendation system is powered by Genkit and can be extended in `src/ai/flows/recommendation-flow.ts`.

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

## License

MIT
