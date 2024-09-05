import { useEffect, useState } from "react";
import PhoneVerify from "./PhoneVerify";
import firebase from "firebase/compat/app";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function SignupForm() {
  const firebaseConfig = {
    apiKey: "AIzaSyDkcqaMW-3B5MPIah69t7UXJGCPjjihI4k",
    authDomain: "jyo-fashion-fiesta-6ddaa.firebaseapp.com",
    projectId: "jyo-fashion-fiesta-6ddaa",
    storageBucket: "jyo-fashion-fiesta-6ddaa.appspot.com",
    messagingSenderId: "437720927659",
    appId: "1:437720927659:web:572a5e7c8d64caa72b16ee",
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  // const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unSubscriber = onAuthStateChanged(firebase.auth(), (currentUser) => {
      console.log(currentUser);
      // setUser(currentUser);
      if (currentUser) {
        // If user is authenticated, redirect to home
        navigate('/home');
      }
    });

    return () => unSubscriber();
  }, [navigate]);

  const handleSignInClick = () => {
    navigate("/login"); // Navigate to login page
  };

  return (
    <>
      <PhoneVerify auth={firebase.auth()} setError={setError}></PhoneVerify>
      {error && <div className="error">{error}</div>}
      <div className="text-center mb-3">
        <span>Already a user? </span>
        <button onClick={handleSignInClick} style={{ border: "none", background: "none", color: "blue", cursor: "pointer", textDecoration: "underline" }}>
          Sign In
        </button>
      </div>
    </>
  );
}

export default SignupForm;












// import { useEffect, useState } from "react";
// import PhoneVerify from "./PhoneVerify";
// import firebase from "firebase/compat/app";
// import { onAuthStateChanged } from "firebase/auth";

// function SignupForm() {
//   const firebaseConfig = {
//     apiKey: "AIzaSyBGVvP46AZofbBluWTGWFDT-KuADX5sBFU",
//     authDomain: "jyo-fashion-f460e.firebaseapp.com",
//     projectId: "jyo-fashion-f460e",
//     storageBucket: "jyo-fashion-f460e.appspot.com",
//     messagingSenderId: "66409701916",
//     appId: "1:66409701916:web:8f09989a64b2d6d045b5d9",
//   };

//   // Initialize Firebase
//   firebase.initializeApp(firebaseConfig);

//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unSubscriber = onAuthStateChanged(firebase.auth(), (currentUser) => {
//       console.log(currentUser);
//       setUser(currentUser);
//     });

//     return () => unSubscriber();
//   }, []);

//   return (
//     <div className="App">
//       <h1>Verify Phone Number with OTP</h1>
//       <PhoneVerify auth={firebase.auth()}></PhoneVerify>
//     </div>
//   );
// }

// export default SignupForm;
