// FILE: hooks/auth.ts
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
const AUTH_TOKEN_KEY = 'userToken'; // Key for storing the token in AsyncStorage
const USER_DATA_KEY = 'userData'; // Optional: Key for storing user info

// --- Types ---
interface User {
  // Define the structure of your user object
  // Example:
  id: string;
  email: string;
  name?: string;
  // Add other relevant user fields
}

interface AuthContextData {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean; // Indicates if auth status is being checked initially
  login: (credentials: Record<string, unknown>) => Promise<void>; // Adjust credentials type as needed
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
  useEffect(() => {
    const loadAuthData = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_DATA_KEY);

        if (token) {
          // --- TODO: Validate token with backend (optional but recommended) ---
          // If the token is valid, set authenticated state
          setIsAuthenticated(true);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // Optionally fetch user data from backend if not stored locally
            // const fetchedUser = await api.fetchCurrentUser(token);
            // setUser(fetchedUser);
            // await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(fetchedUser));
          }
        } else {
          // No token found
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (e) {
        console.error("AuthProvider: Failed to load auth data", e);
        // Ensure clean state on error
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false); // Finished loading auth status
      }
    };

    loadAuthData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Login Function ---
  const login = async (credentials: Record<string, unknown>) => {
    setIsLoading(true);
    console.log("AuthProvider: Attempting login with:", credentials);
    try {
      // --- TODO: Replace with your actual API login call ---
      // Example: const response = await api.login(credentials);
      // Simulate API call success
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fakeToken = `fake-token-${Date.now()}`;
      const fakeUser: User = { id: 'user-123', email: credentials.email as string, name: 'Mock User' };
      // const { token, userData } = response; // Assuming API returns token and user data
      // --- End of TODO ---

      // Store token and user data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, fakeToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(fakeUser));

      // Update state
      setUser(fakeUser);
      setIsAuthenticated(true);
      console.log("AuthProvider: Login successful");

    } catch (error) {
      console.error("AuthProvider: Login failed:", error);
      // Clear any potentially stored invalid data
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      setIsAuthenticated(false);
      setUser(null);
      Alert.alert("Erro de Login", "Não foi possível entrar. Verifique suas credenciais.");
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

      // Clear stored data
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);

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
  // Corrected the value prop syntax below
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