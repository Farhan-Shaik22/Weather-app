# Weather-App Technical Documentation

## Deployed Link

### [Click Here](https://weather-app-clerk.vercel.app/)

## Table of Contents

- [Steps to Run the Project](#steps-to-run-the-project)
- [Environment Variables](#environment-variables)
- [Things to Keep in Mind](#things-to-keep-in-mind)


## Steps to Run the Project

1. Clone the repository:

   ```bash
   git clone https://github.com/Farhan-Shaik22/Weather-app.git
   ```

2. Install dependencies:

   ```bash
   cd backend
   npm install
   ```
    ```bash
   cd frontend
   npm install
   ```

3. Run the Frontend Development Server:

   ```bash
   cd frontend
   npm run dev
   ```
4. Run the Backend Server:

   ```bash
   cd backend
   npm start
   ```

## Environment Variables

1.Backend .env file
   ```bash
  AES_SECRET_KEY=put a secret key of your choice
  SECRET_TOKEN = put a secret token of your choice
  MONGO_STRING= Put your MongoDb string
  API_KEY= Insert Weather.org Api key from its website
  USER= Put the gmail id that you want to use to send the emails to users for alerts
  PASS= App password for that gmail account
   ```
1.Backend .env.local file
   ```bash
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= Get this from the [clerk website](https://clerk.com/) after configuring a project for next js.
    CLERK_SECRET_KEY= Get this from the [clerk website](https://clerk.com/) after configuring a project for next js.
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
    NEXT_PUBLIC_API_URL= put the production backend url or localhost
   ```

## Things to Keep in Mind
1. Change the cors configuration in the server.js while using it in local.
2. Create a webhook in the clerk project settings with production server link/webhook/create and also set the token in custom headers 
 in advanced settings and set it as your SECRET_TOKEN set as your environment variable. Select the user.created event.
 ![image](https://github.com/user-attachments/assets/1159c4fd-df28-4ebb-ad0f-ea8214b9a2d0)

## Tech Stack Used
- **Frontend**: Next.js with TailwindCSS
- **Backend**: Node.js
- **Database**: MongoDB

## Features Analysis

### 1. Real-Time Weather Monitoring
- Displays current weather conditions including temperature, humidity, and wind speed.
- Updates data regularly through a scheduler system.
- Supports multiple temperature units (Celsius, Fahrenheit, Kelvin).
- Shows weather conditions with appropriate icons.

### 2. Historical Weather Data
- Maintains hourly weather records.
- Presents data through interactive charts using Recharts.
- Tracks multiple parameters:
  - Temperature trends.
  - Humidity levels.
  - Wind speed variations.
  - Weather conditions.

### 3. Daily Weather Summaries
- Generates comprehensive daily weather statistics.
- Includes:
  - Average temperature.
  - Maximum and minimum temperatures.
  - Average humidity.
  - Average wind speed.
  - Dominant weather condition for the day.
- Updates automatically through a scheduler.

### 4. Multi-City Support
- Allows users to select and monitor different cities.
- Maintains separate weather records for each city.
- Enables quick switching between locations.

### 5. Weather Alert System
- User-specific weather alerts.
- Customizable threshold settings:
  - Temperature-based alerts.
  - Supports multiple comparison operators (greater than, less than, equal to).
- Alert history tracking.
- Real-time alert notifications.
- Automated alert checking through a scheduler.

### 6. User Authentication & Management
- Secure user authentication using Clerk.
- User-specific data storage.
- Encrypted user IDs for enhanced security.
- Protected API endpoints.

### 7. Interactive Data Visualization
- Dynamic area charts for weather parameters.
- Responsive design that adapts to different screen sizes.
- Custom styling with gradient effects.
- Interactive tooltips for detailed information.

### 8. Security Features
- CORS protection with specific origin allowance.
- Encrypted user data.
- Webhook authentication with secret tokens.
- Secure API endpoints.

### 9. Data Management
- MongoDB integration for data storage.
- Automated data collection and updates.
- Structured data models for:
  - Weather data.
  - User information.
  - Alerts.
  - Daily summaries.

### 10. UI/UX Features
- Interactive elements for user engagement.
- Clear data presentation and visualization.
- Modal interfaces for alert configuration.
