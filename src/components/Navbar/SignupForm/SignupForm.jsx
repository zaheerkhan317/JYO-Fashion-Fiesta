import { useEffect, useState } from "react";
import PhoneVerify from "./PhoneVerify";
import firebase from "firebase/compat/app";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function SignupForm() {
  const firebaseConfig = {
    apiKey: "AIzaSyAmiN-jCQ92rYdf8ttrxrpheeGmAJ3KxVA",
    authDomain: "jyo-fashion-fiesta.firebaseapp.com",
    databaseURL: "https://jyo-fashion-fiesta-default-rtdb.firebaseio.com",
    projectId: "jyo-fashion-fiesta",
    storageBucket: "jyo-fashion-fiesta.appspot.com",
    messagingSenderId: "430873953674",
    appId: "1:430873953674:web:26f71e479f11da127f3473",
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
