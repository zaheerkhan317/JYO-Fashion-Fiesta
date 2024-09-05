import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig'; // Adjust the import path as necessary

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const loggedInUser = localStorage.getItem('adminUser');
    if (loggedInUser) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      // Fetch admin credentials from Firestore
      const docRef = doc(db, "Admins", "S9QXPx7RvgxtTaQMKeez"); // Reference to a specific document
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Admin Data:", data);

        if (username === data.username && password === data.password) {
          // Save login state in localStorage
          localStorage.setItem('adminUser', JSON.stringify({ username }));

          // Redirect to admin dashboard
          navigate('/admin/dashboard');
        } else {
          setError('Invalid username or password');
        }
      } else {
        setError('No credentials found');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Error logging in. Please try again later.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="row">
        <div className="col-md-12 col-lg-12 col-xl-12">
          <div className="card border-0 rounded-lg shadow-lg">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4 font-weight-bold">Admin Login</h3>
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label font-weight-bold">Username</label>
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-pill"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="form-label font-weight-bold">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg rounded-pill"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                <button type="submit" className="btn btn-primary w-100 rounded-pill py-2">Login</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;















// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const AdminLogin = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   // Check if user is already logged in
//   useEffect(() => {
//     const loggedInUser = localStorage.getItem('adminUser');
//     if (loggedInUser) {
//       navigate('/dashboard');
//     }
//   }, [navigate]);

//   const handleLogin = async (event) => {
//     event.preventDefault();

//     try {
//       const response = await fetch('/data/admin.json');
//       if (!response.ok) {
//         throw new Error('Network response was not ok at admin');
//       }
//       const data = await response.json();

//       if (username === data.username && password === data.password) {
//         // Save login state in localStorage
//         localStorage.setItem('adminUser', JSON.stringify({ username }));

//         // Redirect to admin dashboard
//         navigate('/dashboard');
//       } else {
//         setError('Invalid username or password');
//       }
//     } catch (err) {
//       console.error('Error fetching admin data:', err);
//       setError('Error logging in. Please try again later.');
//     }
//   };

//   return (
//     <div className="container">
//       <h2 className="my-4">Admin Login</h2>
//       <form onSubmit={handleLogin}>
//         <div className="mb-3">
//           <label htmlFor="username" className="form-label">Username</label>
//           <input
//             type="text"
//             className="form-control"
//             id="username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//           />
//         </div>
//         <div className="mb-3">
//           <label htmlFor="password" className="form-label">Password</label>
//           <input
//             type="password"
//             className="form-control"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         {error && <div className="alert alert-danger">{error}</div>}
//         <button type="submit" className="btn btn-primary">Login</button>
//       </form>
//     </div>
//   );
// };

// export default AdminLogin;
