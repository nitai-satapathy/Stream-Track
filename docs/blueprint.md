# **App Name**: CineStream

## Core Features:

- Fetch Movie Data: Fetch popular movies from The Movie Database (TMDB) API. Requires an API key from TMDB to function.
- Display Popular Movies: Display a horizontal, scrollable row of movie cards featuring movie posters, titles, and ratings.
- Movie Details Modal: Implement a modal to display the full description, release date, genres, and a link to watch the trailer on YouTube when a movie card is clicked.
- Loading State: Provide loading states for the display of Movie data. While the data is loading a skeleton view will be displayed.
- Trailer AI Tool: When a movie is missing its youtube trailer, this tool will search YouTube for one. If a trailer can be located using reasoning, this tool will make the button to watch the trailer available.
- Add Movie Rows: Enable adding and displaying additional rows such as 'Top Rated' or 'Upcoming' movies by integrating various TMDB API endpoints.

## Style Guidelines:

- Primary color: Deep indigo (#4B0082) to evoke a sense of cinematic immersion.
- Background color: Dark gray (#222222) to create a modern, theater-like environment.
- Accent color: Vibrant orange (#FF4500) to highlight interactive elements and calls to action.
- Font: 'Inter', a sans-serif for a clean and modern aesthetic, used for both headings and body text.
- Responsive layout using Tailwind CSS to adapt to various screen sizes.
- Minimalist icons for ratings and genres, enhancing usability without clutter.
- Subtle transitions and animations for loading states and modal appearances to provide a smooth user experience.