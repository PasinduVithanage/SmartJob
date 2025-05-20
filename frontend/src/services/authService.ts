interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    savedJobs: string[];
    appliedJobs: string[];
    cv?: string;
  };
}

const API_URL = 'http://localhost:5000/api';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Include cookies for session management if needed
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signupUser = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Include cookies for session management if needed
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Signup failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  // If you implement a server-side logout endpoint later
  // try {
  //   await fetch(`${API_URL}/auth/logout`, {
  //     method: 'POST',
  //     credentials: 'include',
  //   });
  // } catch (error) {
  //   console.error('Logout error:', error);
  // }
};