
---

## Features

### Frontend ([frontend/](frontend))
- **React + Vite**: Fast, modern UI.
- **Authentication**: Signup, login, password reset (OTP via email).
- **Weather Dashboard**: View, create, update, delete weather entries.
- **World Map**: Interactive map for weather by location.
- **Live Alerts**: AI-generated daily weather alerts.
- **Export**: Download weather data in JSON, CSV, PDF, Markdown.
- **Profile & Settings**: Manage user info.
- **YouTube Videos**: Latest weather-related videos for searched locations.

### Backend ([backend/](backend))
- **Express API**: RESTful endpoints for weather, auth, profile, export, alerts.
- **MongoDB**: Stores users, weather entries, locations.
- **OpenWeatherMap Integration**: Real-time weather and forecast data.
- **YouTube API**: Fetches weather videos.
- **Email/OTP**: Password reset via email.
- **Python LLM**: Generates daily weather alerts using local model ([generate_script.py](backend/generate_script.py)).
- **Firebase**: Admin SDK setup for future integrations.

---

## Getting Started

### Prerequisites
- Node.js & npm
- Python (for alerts)
- MongoDB (local or cloud)
- API keys: OpenWeatherMap, YouTube, Gmail (for email), etc.

### Backend Setup
1. Install dependencies:
   ```sh
   cd backend
   npm install