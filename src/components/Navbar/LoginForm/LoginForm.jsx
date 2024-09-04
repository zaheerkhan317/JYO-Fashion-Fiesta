import React, { useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../Context/UserProvider';
import SignInWithGoogle from './SignInWithGoogle';
import 'bootstrap/dist/css/bootstrap.min.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setFirstName, setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const db = getDatabase();
      const userRef = ref(db, 'users');
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const user = Object.values(users).find(user => user.email === email.trim());

        if (user && user.password === password.trim()) {
          setUser(user);
          setFirstName(user.firstName);
          localStorage.setItem('firstName', user.firstName);
          console.log("firstname in loginform : ",user.firstName);

          setUser({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            password: user.password,
          });
          
          navigate('/home');
        } else {
          setError('Invalid email or password');
        }
      } else {
        setError('No users found');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error during login. Please try again.');
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-center">
              <h3>Login</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <button type="submit" className="btn btn-primary w-100">Login</button>
              </form>
              <hr />
              <SignInWithGoogle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
