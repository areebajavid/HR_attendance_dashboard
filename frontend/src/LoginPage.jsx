import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (event) => {
    console.log('1. handleSubmit function started.'); // DEBUG
    event.preventDefault();
    setError('');

    try {
      console.log('2. Calling auth.login...'); // DEBUG
      const success = await auth.login(username, password);
      console.log('4. auth.login finished. The result was:', success); // DEBUG

      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      console.error('An error occurred in handleSubmit:', err); // DEBUG
      setError('An unexpected error occurred.');
    }
  };

  return (
    <main className="container" style={{ maxWidth: '400px', margin: 'auto', paddingTop: '5rem' }}>
      <article>
        <h1 style={{ textAlign: 'center' }}>Dashboard Login</h1>
        <form onSubmit={handleSubmit}>
          {/* ... JSX for the form is unchanged ... */}
          <label htmlFor="username">Username<input type="text" id="username" name="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
          <label htmlFor="password">Password<input type="password" id="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {error && <p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p>}
          <button type="submit">Login</button>
        </form>
      </article>
    </main>
  );
}

export default LoginPage;