import React, { useContext } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../../../firebaseConfig';
import { toast } from 'react-toastify';
import google from '../../../img/google.png';
import { UserContext } from '../../Context/UserProvider'; // Correct import path
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
        const firstName = user.displayName.split(' ')[0] || '';
        const lastName = user.displayName.split(' ')[1] || '';
        const userEmail = user.email;
        const userPhoto = user.photoURL;
        // Update UserContext with the new user data
        setUser({
          email: userEmail,
          firstName: firstName,
          lastName: lastName,
          photo: userPhoto,
        });
        console.log("set USer",setUser);
        setFirstName(user.displayName.split(' ')[0] || '');

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: userEmail,
            firstName: firstName,
            lastName: lastName,
            photo: userPhoto,
            createdAt: new Date().toISOString(), // Add a timestamp of account creation
          });
        }

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
