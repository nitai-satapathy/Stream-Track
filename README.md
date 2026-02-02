# Stream Track

**Track What You Watch. Love What You Watch. Never Forget a Single Show.**

Stream Track is a modern web application designed for movie and TV enthusiasts to track their watching habits. It features a robust recommendation system powered by **Groq AI**, a sleek responsive UI, and seamless authentication.

## Features

- **User Authentication:** Secure signup and login using **NextAuth.js** with **MongoDB** storage.
- **Personal Lists:** Manage your **Watchlist**, **Watching**, and **Watched** history for both movies and TV shows.
- **AI Recommendations:** Get personalized recommendations based on your unique viewing history using **Groq AI (Llama 3)** (via Genkit).
- **Powerful Search:** Instantly find movies and TV shows using **TMDb API**.
- **Notifications:** Stay updated with system announcements and maintenance notices.
- **Responsive UI:** Built with **Next.js 15**, **Tailwind CSS**, and **Radix UI** for a premium experience on mobile and desktop.
- **Persistent Storage:** User data is securely stored in **MongoDB Atlas**. Guest users can also test features using local storage.
- **Guest Data Sync:** Automatically merges guest activity (local storage) with your account upon login.
- **Bulk Add:** Quickly paste a list of movies to add them to your watched history in one go.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Radix UI.
- **Backend:** Server Actions (Next.js), Node.js.
- **Database:** MongoDB (via Mongoose).
- **Authentication:** NextAuth.js (Credentials Provider).
- **AI Integration:** Genkit with Groq Plugin.
- **Data Source:** TMDb (The Movie Database).

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

- **Node.js**: Version 18+ installed.
- **MongoDB Atlas**: A cloud database cluster (or local instance).
- **TMDb API Key**: Sign up at [themoviedb.org](https://www.themoviedb.org/).
- **Groq API Key**: Get your key from [Groq Console](https://console.groq.com/).

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/nitai-satapathy/Stream-Track.git
   cd Stream-Track
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:

   ```env
   # Database Connection (MongoDB Atlas)
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/stream-track?retryWrites=true&w=majority

   # Authentication Secret (Generate one with `openssl rand -base64 32`)
   NEXTAUTH_SECRET=your_secret_key_here
   NEXTAUTH_URL=http://localhost:3000

   # External APIs
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
   GROQ_API_KEY=your_groq_api_key_here

   # Genkit Configuration
   GENKIT_ENV=dev
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:9002](http://localhost:9002) (or user configured port).

## Project Structure

```
src/
├── app/               # Next.js App Router pages (Search, Login, Dashboard)
├── components/        # Reusable UI components (Header, MovieCard, Modals)
├── lib/               # Utilities, Database connection, Notifications data
├── models/            # Mongoose Schemas (User)
├── actions/           # Server Actions for Data Mutations
├── hooks/             # Custom React Hooks (useAuth, useListManager)
├── ai/                # Genkit AI Logic flows
└── public/            # Static assets
```

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code issues.
- `npm run typecheck`: Checks TypeScript types.
- `npm run genkit:dev`: Starts the Genkit developer UI for testing AI flows.

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

## License

MIT License. Free to use and modify.
