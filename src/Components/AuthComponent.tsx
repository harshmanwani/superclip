import { useAuth0 } from '@auth0/auth0-react';
import "./AuthComponent.css";

interface AuthComponentProps {
  setError: (error: string) => void;
}

function AuthComponent({ setError }: AuthComponentProps) {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithRedirect();
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <button onClick={handleLogin} className="auth-button">
        Sign In
      </button>
    </div>
  );
}

export default AuthComponent;