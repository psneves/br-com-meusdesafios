import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // For basic feedback

// --- Constants ---
// For this simple hardcoded login, we won't actually store a token persistently.
// The isAuthenticated state will be managed in memory after a successful login attempt.
// If you were implementing a real auth system, you would use these keys.
// const AUTH_TOKEN_KEY = 'userToken';
// const USER_DATA_KEY = 'userData';

// --- Hardcoded Predefined Users for Testing ---
// Create an array of user objects with email, password, and other potential user data
const PREDEFINED_USERS = [
  { 
    id: 'user1', 
    email: 'paulo@psneves.com.br', 
    password: 'senha248', 
    username: 'psneves', 
    name: 'Paulo Neves',
    profileImageUrl: '@/assets/images/profile.jpeg',
    instagramHandle: '@desconhecido',
    tiktokHandle: '@desconhecido'
  },
  { 
    id: 'user2', 
    email: 'jessica.taglialegna@gmail.com', 
    password: 'senha456', 
    username: 'jess_neves', 
    name: 'Jessica Neves',
    profileImageUrl: '@/assets/images/profile.jpeg',
    instagramHandle: '@desconhecido',
    tiktokHandle: '@desconhecido'
  },
  { 
    id: 'user3', 
    email: 'user3@gmail.com', 
    password: 'senha789', 
    username: 'user3', 
    name: 'User Three',
    profileImageUrl: '@/assets/images/profile.jpeg',
    instagramHandle: '@desconhecido',
    tiktokHandle: '@desconhecido'
  },
  { 
    id: 'user4', 
    email: 'user4@gmail.com', 
    password: 'senhaabc', 
    username: 'user4', 
    name: 'User Four',
    profileImageUrl: '@/assets/images/profile.jpeg',
    instagramHandle: '@desconhecido',
    tiktokHandle: '@desconhecido'
  },
  { 
    id: 'user5', 
    email: 'user5@gmail.com', 
    password: 'senhadef', 
    username: 'user5', 
    name: 'User Five',
    profileImageUrl: '@/assets/images/profile.jpeg',
    instagramHandle: '@desconhecido',
    tiktokHandle: '@desconhecido'
  },
];

// --- Types ---
interface User {
  // Define the structure of your user object
  id: string;
  email: string; // Keep email as it's the login identifier
  username: string; // Added username/handle
  name?: string; // Optional name
  profileImageUrl?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  // Add other relevant user fields that come from your "user data"
  // Example:
  // stats?: { challengesCompleted: number; currentStreak: number; totalPoints: number; };
  // badges?: { id: string; name: string; icon: string; }[];
}

interface AuthContextData {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean; // Indicates if auth status is being checked initially
  // Updated login function to expect 'email' instead of 'username'
  login: (credentials: { email?: string; password?: string; [key: string]: any }) => Promise<void>; // Allow email/password or other props
  logout: () => Promise<void>;
  // You might add other functions like signup, checkAuthStatus, etc.
}

// --- Context ---
// Create the context with a default value (can be undefined or a default object)
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// --- Provider Component ---
// This component will wrap your app or relevant parts to provide the auth context.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until initial check is done

  // Check initial authentication status when the provider mounts
  // For this hardcoded example, we'll always start unauthenticated
  useEffect(() => {
    // In a real app, you would check AsyncStorage for a token here
    // and potentially validate it with your backend.
    // Since we're not storing a token for the hardcoded login,
    // we just set isLoading to false and isAuthenticated to false.
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
    console.log("AuthProvider: Initial auth check complete (always unauthenticated for hardcoded login)");
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Login Function ---
  // Updated function to accept 'email' in credentials
  const login = async (credentials: { email?: string; password?: string; [key: string]: any }) => {
    setIsLoading(true);
    console.log("AuthProvider: Attempting login with email:", credentials.email); // Log email only

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const { email, password } = credentials;

      // --- Hardcoded Credential Check against the list ---
      const foundUser = PREDEFINED_USERS.find(
        u => u.email === email && u.password === password
      );

      if (foundUser) {
        // Simulate successful login
        // In a real app, you would receive and store a token here
        // await AsyncStorage.setItem(AUTH_TOKEN_KEY, fakeToken);
        // await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(foundUser)); // Store the found user

        // Update state with the found user's details
        setUser(foundUser);
        setIsAuthenticated(true);
        console.log("AuthProvider: Login successful for user:", foundUser.email);
        // No need for Alert on success, navigation handles it

      } else {
        // Simulate failed login
        console.warn("AuthProvider: Login failed - Invalid credentials for email:", email);
        Alert.alert("Erro de Login", "E-mail ou senha inválidos."); // Updated error message
        // Ensure state is unauthenticated
        setIsAuthenticated(false);
        setUser(null);
        // In a real app, clear any old tokens
        // await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        // await AsyncStorage.removeItem(USER_DATA_KEY);
      }

    } catch (error) {
      console.error("AuthProvider: An unexpected error occurred during login:", error);
      Alert.alert("Erro de Login", "Ocorreu um erro inesperado. Tente novamente.");
      // Ensure state is unauthenticated on error
      setIsAuthenticated(false);
      setUser(null);
      // In a real app, clear any old tokens
      // await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      // await AsyncStorage.removeItem(USER_DATA_KEY);
      // Re-throw the error if the calling component needs to handle it further
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logout Function ---
  const logout = async () => {
    setIsLoading(true);
    console.log("AuthProvider: Logging out");
    try {
      // --- TODO: Optional: Call backend logout endpoint if necessary ---
      // await api.logout();
      // --- End of TODO ---

      // Clear stored data (if any were stored, though not in this simple example)
      // await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      // await AsyncStorage.removeItem(USER_DATA_KEY);

      // Update state
      setUser(null);
      setIsAuthenticated(false);
      console.log("AuthProvider: Logout successful");

    } catch (error) {
      console.error("AuthProvider: Logout failed:", error);
      Alert.alert("Erro", "Não foi possível sair.");
      // Decide if you want to keep the user logged in locally on error,
      // or force logout locally regardless. Forcing local logout is safer.
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the context value to children
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Custom Hook ---
// This hook simplifies consuming the auth context in components.
export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    // This error means you're trying to use useAuth() outside of an AuthProvider.
    // Ensure your app is wrapped correctly.
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};