// web-backend/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import { pool } from '@/lib/db'; // Assuming you created lib/db.ts
// You would typically use a library like bcrypt for password hashing
// import bcrypt from 'bcryptjs';
// You would typically use a library like jsonwebtoken for tokens
// import jwt from 'jsonwebtoken';

// Define the expected request body structure
interface LoginRequestBody {
  email?: string;
  password?: string;
}

// Handle POST requests to /api/auth/login
export async function POST(request: Request) {
  try {
    const { email, password }: LoginRequestBody = await request.json();

    // --- Basic Validation ---
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // --- Database Query ---
    // In a real application, you would:
    // 1. Query the database for a user with the given email.
    // 2. Use bcrypt.compare() to compare the provided password with the hashed password from the database.
    // 3. If credentials match, generate a JWT token and return it along with basic user info.
    // 4. If credentials don't match, return an authentication error.

    // --- Placeholder Logic (Replace with actual DB interaction) ---
    console.log(`Attempting login for email: ${email}`);

    // Simulate finding a user in the database (replace with actual query)
    const client = await pool.connect();
    try {
      // Example query: SELECT id, email, password_hash, username, name FROM users WHERE email = $1
      // NOTE: This example ASSUMES you have a 'users' table with 'email' and 'password_hash' columns.
      // You MUST hash passwords in a real application.
      const result = await client.query('SELECT id, email, username, name, profile_image_url FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        // User not found
        console.warn(`Login failed: User not found for email ${email}`);
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      // --- Password Check (Replace with bcrypt.compare in production) ---
      // For this example, we'll do a plain text comparison (INSECURE!)
      // In production: const passwordMatch = await bcrypt.compare(password, user.password_hash);
      // For this placeholder, let's assume a simple check or use the hardcoded users from mobile for now
      // To match the mobile's hardcoded users for this example:
      const PREDEFINED_USERS = [
        { email: 'paulo@psneves.com.br', password: 'senha248', id: 'user1', username: 'psneves', name: 'Paulo Neves', profile_image_url: null },
        { email: 'jessica.taglialegna@gmail.com', password: 'senha456', id: 'user2', username: 'jess_neves', name: 'Jessica Neves', profile_image_url: null },
        // ... add others if needed for testing
      ];
      const foundHardcodedUser = PREDEFINED_USERS.find(u => u.email === email && u.password === password);

      if (!foundHardcodedUser) {
         console.warn(`Login failed: Password mismatch for email ${email}`);
         return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      // --- Successful Login ---
      // In a real app, generate a token here:
      // const token = jwt.sign({ userId: user.id, email: user.email }, process.env.AUTH_SECRET!, { expiresIn: '1d' });

      // Return success response with user data (and token in a real app)
      console.log(`Login successful for user: ${email}`);
      return NextResponse.json({
        message: 'Login successful',
        // token: token, // Include token in a real app
        user: { // Return necessary user info
          id: foundHardcodedUser.id, // Use ID from hardcoded user for consistency with mobile mock
          email: foundHardcodedUser.email,
          username: foundHardcodedUser.username,
          name: foundHardcodedUser.name,
          profileImageUrl: foundHardcodedUser.profile_image_url,
          // Add other user fields as needed by the mobile app
        }
      }, { status: 200 });

    } finally {
      client.release(); // Release the database client back to the pool
    }

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}