// web-backend/app/api/user/challenges/route.ts

import { NextResponse } from 'next/server';
import { pool } from '@/lib/db'; // Assuming you created lib/db.ts
// You'll need middleware or a helper to get the authenticated user's ID
// import { getAuthenticatedUser } from '@/lib/auth'; // Example auth helper

// Define the structure of a challenge returned by the API
interface UserChallenge {
  id: string;
  title: string;
  description: string;
  goal_duration: number; // Use snake_case if that's your DB convention
  current_progress: number;
  unit: string;
  start_date: string; // ISO 8601 Date string
  deadline_multiplier: number;
  history: (boolean | null)[]; // Array of completion status per day
}

// Handle GET requests to /api/user/challenges
export async function GET(request: Request) {
  try {
    // --- Authentication Check (Crucial!) ---
    // In a real application, you would verify the user's token/session
    // and get their user ID.
    // const user = await getAuthenticatedUser(request); // Example auth helper
    // if (!user) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    // const userId = user.id;

    // --- Placeholder User ID (Replace with authenticated user ID) ---
    // For this example, we'll use a hardcoded user ID to simulate fetching data
    // for a specific user. In production, this MUST come from authentication.
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'user1'; // Get from query param for testing, default to 'user1'


    // --- Database Query ---
    // Query the database to get challenges assigned to this user.
    // This requires a database schema that links users to challenges and their progress/history.
    // Example schema idea:
    // - users table (id, email, username, ...)
    // - challenges table (id, title, description, goal_duration, unit, deadline_multiplier, ...)
    // - user_challenges table (id, user_id, challenge_id, start_date, current_progress, ...)
    // - challenge_history table (id, user_challenge_id, date, completed, ...)

    // --- Placeholder Logic (Replace with actual DB interaction) ---
    console.log(`Fetching challenges for user ID: ${userId}`);

    const client = await pool.connect();
    try {
      // Example query: SELECT uc.*, c.title, c.description, c.goal_duration, c.unit, c.deadline_multiplier
      // FROM user_challenges uc JOIN challenges c ON uc.challenge_id = c.id
      // WHERE uc.user_id = $1;
      // You would also need to fetch the history for each user_challenge.
      // This is a simplified mock query returning static data for the placeholder.

      // To match the mobile's static data for this example:
      const initialChallengesData = [
        {
          id: 'run',
          title: 'Correr 5km por 30 dias',
          description: 'Complete uma corrida de 5km diariamente.',
          goal_duration: 30,
          current_progress: 12,
          unit: 'dias',
          start_date: '2024-07-20T00:00:00.000Z',
          deadline_multiplier: 1.5,
          history: [false, false, true, true, false, true, true, false, true, true],
        },
        {
          id: 'meditate',
          title: 'Meditar 20min por 21 dias',
          description: 'Dedique 20 minutos para meditação focada.',
          goal_duration: 21,
          current_progress: 18,
          unit: 'dias',
          start_date: '2024-07-15T00:00:00.000Z',
          deadline_multiplier: 2,
          history: [true, true, true, false, true, true, true, true, false, true, true],
        },
        {
          id: 'read',
          title: 'Ler 10 páginas por 90 dias',
          description: 'Leia no mínimo 10 páginas de um livro.',
          goal_duration: 90,
          current_progress: 45,
          unit: 'dias',
          start_date: '2024-06-01T00:00:00.000Z',
          deadline_multiplier: 1.25,
          history: [false, true, true, true, true, false, true, true, true, false],
        },
      ];

      // Simulate fetching data for 'user1'
      const userChallenges: UserChallenge[] = userId === 'user1' ? initialChallengesData : [];

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));


      // Return the list of challenges
      return NextResponse.json(userChallenges, { status: 200 });

    } finally {
      client.release(); // Release the database client back to the pool
    }

  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}