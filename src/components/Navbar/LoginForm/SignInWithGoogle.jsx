import React, { useContext } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { toast } from 'react-toastify';
import google from '../../../img/google.png';
import { UserContext } from '../../Context/UserProvider'; // Correct import path
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const SignInWithGoogle = () => {
  const { setUser, setFirstName } = useContext(UserContext); // Get context setters
  const navigate = useNavigate(); // Initialize useNavigate

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("1st line");
      if (user) {
        console.log("got user 2nd line");
        
        console.log("setting user.....");
        // Update UserContext with the new user data
        setUser({
          email: user.email,
          firstName: user.displayName.split(' ')[0] || '',
          lastName: user.displayName.split(' ')[1] || '',
          photo: user.photoURL,
        });
        console.log("set USer",setUser);
        setFirstName(user.displayName.split(' ')[0] || '');

        toast.success('User logged in successfully', {
          position: 'top-center',
        });
        console.log("navigating to home");
        navigate('/home'); // Use navigate to change the route
      }
    } catch (error) {
      console.error('Error during Google login or Firestore operation:', error);
      toast.error('An error occurred. Please try again later.', {
        position: 'top-center',
      });
    }
  };

  return (
    <div>
      <p className="continue-p text-center">--Or continue with--</p>
      <div
        style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
        onClick={googleLogin}
      >
        <img src={google} width={"40%"} alt="Google sign-in" />
      </div>
    </div>
  );
};

export default SignInWithGoogle;
