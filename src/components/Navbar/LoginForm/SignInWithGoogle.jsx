import React, { useContext } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../../../firebaseConfig';
import { toast } from 'react-toastify';
import google from '../../../img/google.png';
import { UserContext } from '../../Context/UserProvider'; // Correct import path
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore';

const SignInWithGoogle = () => {
  const { setUser, setFirstName } = useContext(UserContext); // Get context setters
  const navigate = useNavigate(); // Initialize useNavigate

  const getISTDate = (date) => {
    const options = {
      timeZone: 'Asia/Kolkata', // IST timezone
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
            createdAt: getISTDate(new Date()).toString(), // Add a timestamp of account creation
          });
        }

        const activitiesRef = collection(db, 'activities');

        await addDoc(activitiesRef, {
          timestamp: getISTDate(new Date()).toString(),
          description: `User ${firstName } ${lastName } registered`,
        });

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
