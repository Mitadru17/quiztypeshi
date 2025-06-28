# C Programming Quiz Platform

A modern, responsive web application for taking C programming quizzes with real-time scoring, detailed results, and admin panel functionality.

## Features

- **Interactive Quiz Interface**: Modern UI with timer, progress tracking, and auto-save functionality
- **User Authentication**: Google Sign-In integration with Firebase Authentication
- **Real-time Results**: Detailed score breakdown with answer review
- **Admin Panel**: Restricted access for quiz management and result analysis
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Data Persistence**: Quiz state saved locally and results stored in Firebase
- **PDF Export**: Generate detailed result reports

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **PDF Generation**: jsPDF
- **State Management**: React Hooks with localStorage persistence

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Mitadru17/quiztypeshi.git
cd quiztypeshi
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Google Sign-In
   - Create a Firestore database
   - Add your Firebase configuration to `src/services/firebase.ts`

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # Firebase and API services
├── types/              # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Google Authentication
3. Create a Firestore database
4. Update the Firebase configuration in `src/services/firebase.ts`

### Admin Access

To access the admin panel, the user's email must match the admin email configured in the authentication service.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Detail

### Quiz Interface
- Timer with auto-submission
- Progress indicator
- Auto-save functionality
- Responsive design for all devices

### Results System
- Detailed score breakdown
- Answer review with correct/incorrect indicators
- PDF export functionality
- Historical result tracking

### Admin Panel
- View all quiz results
- User management
- Export functionality
- Restricted access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub. 