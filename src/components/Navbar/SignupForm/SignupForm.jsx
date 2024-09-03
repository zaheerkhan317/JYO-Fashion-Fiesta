import { useEffect, useState } from "react";
import PhoneVerify from "./PhoneVerify";
import firebase from "firebase/compat/app";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function SignupForm() {
  const firebaseConfig = {
    apiKey: "AIzaSyDxZVJLJN-zyGrlWjheCnx0DhvYsorb1w8",
    authDomain: "jyo-fashion-47b0c.firebaseapp.com",
    projectId: "jyo-fashion-47b0c",
    storageBucket: "jyo-fashion-47b0c.appspot.com",
    messagingSenderId: "706587465005",
    appId: "1:706587465005:web:0193a5b9774d413e48efa4",
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unSubscriber = onAuthStateChanged(firebase.auth(), (currentUser) => {
      console.log(currentUser);
      setUser(currentUser);
      if (currentUser) {
        // If user is authenticated, redirect to home
        navigate('/home', { replace: true }); // Replace ensures /signup is not in the history stack
      }
    });

    return () => unSubscriber();
  }, [navigate]);

  return (
    <>
      <PhoneVerify auth={firebase.auth()} setError={setError}></PhoneVerify>
      {error && <div className="error">{error}</div>}
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
