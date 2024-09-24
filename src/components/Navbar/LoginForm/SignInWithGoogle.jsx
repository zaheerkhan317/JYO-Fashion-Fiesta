import React, { useContext, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../../../firebaseConfig';
import { toast } from 'react-toastify';
import google from '../../../img/google.png';
import { UserContext } from '../../Context/UserProvider';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';

const SignInWithGoogle = () => {
  const { setUser, setFirstName } = useContext(UserContext);
  const navigate = useNavigate();
  const [emailExistsError, setEmailExistsError] = useState(''); // State for error message

  const getISTDate = (date) => {
    const options = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
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
        setFirstName(firstName);

        localStorage.setItem('uid', user.uid);

        // Check if user exists in Firestore by email
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('email', '==', userEmail));
        const userSnapshot = await getDocs(q);

        if (userSnapshot.empty) {
          // User doesn't exist in Firestore, create a new user
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            uid: user.uid,
            email: userEmail,
            firstName: firstName,
            lastName: lastName,
            photo: userPhoto,
            createdAt: getISTDate(new Date()).toString(),
          });

          // Log registration activity
          const activitiesRef = collection(db, 'activities');
          await addDoc(activitiesRef, {
            timestamp: getISTDate(new Date()).toString(),
            description: `User ${firstName} ${lastName} registered`,
          });

          toast.success('User registered and logged in successfully', {
            position: 'top-center',
          });
          navigate('/home');
        } else {
          // User already exists in Firestore, display an error message
          setEmailExistsError('Email already exists, please use a different email.');
          toast.error('Email already exists, please use a different email.', {
            position: 'top-center',
          });
        }
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
      {emailExistsError && (
        <div className="alert alert-danger mt-3" role="alert">
          {emailExistsError}
        </div>
      )}
    </div>
  );
};

export default SignInWithGoogle;
