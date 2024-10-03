import React, { useState } from 'react';
import { getFirestore, getDocs, collection } from "firebase/firestore";
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

  // Email validation function
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle login with validation checks
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message

    // Trim the input values
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Validate email format
    if (!isEmailValid(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate password length
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const db = getFirestore();
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);

      let userFound = false;

      userSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === trimmedEmail && userData.password === trimmedPassword) {
          userFound = true;
          setUser({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            password: userData.password,
          });
          setFirstName(userData.firstName);
          localStorage.setItem('firstName', userData.firstName);
          localStorage.setItem('uid', userData.uid);
          console.log("firstname in loginform : ", userData.firstName);
          localStorage.setItem('activeLink', 'home');
          navigate('/home');
        }
      });

      if (!userFound) {
        setError('Invalid email or password');
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
