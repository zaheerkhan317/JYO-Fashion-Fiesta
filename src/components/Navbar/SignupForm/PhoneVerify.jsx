import React, { useEffect, useState } from "react";
import { getFirestore, doc, setDoc, addDoc, getDocs, query, where, collection, Timestamp } from "firebase/firestore";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { db } from "../../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import './PhoneVerify.css';
import { useUser } from '../../Context/UserProvider';

const PhoneVerify = ({ auth }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode:'+91',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const { setUid, setFirstName, setUser } = useUser();


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

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

      const recaptchaContainer = document.getElementById('send-otp-button');
      if (recaptchaContainer) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainer, {
          'size': 'invisible',
          'callback': (response) => {
            console.log('reCAPTCHA solved, allow send OTP');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired, please re-verify.');
            setError("reCAPTCHA challenge expired. Please try again.");
            window.recaptchaVerifier.reset();
          }
        });
      } else {
        console.error("send-otp-button element not found");
      }

      return () => {
        ui.reset();
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
        }
      };
    } catch (err) {
      console.error('Error setting up reCAPTCHA:', err);
      setError('Error setting up reCAPTCHA. Please try again.');
    }
  }, [auth, navigate, setError]);


  const validateForm = () => {
    const errors = {};
    
    // Check required fields
    if (!formData.firstName) errors.firstName = "First Name is required";
    if (!formData.lastName) errors.lastName = "Last Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.password) {
        errors.password = "Password is required";
    } else if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";
    if (!formData.countryCode) errors.countryCode = "Country code is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`); // Debugging line
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };


  
  const checkUserExists = async () => {
    const { email, countryCode, phoneNumber } = formData;
    const userRef = collection(db, 'users');

    // Check for existing email
    const emailQuery = query(userRef, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    
    // Check for existing phone number
    const phoneQuery = query(userRef, where('phoneNumber', '==', `${countryCode} ${phoneNumber}`));
    const phoneSnapshot = await getDocs(phoneQuery);

    if (!emailSnapshot.empty || !phoneSnapshot.empty) {
      setError('User email and phone number already exists');
      return true; // User exists
    }
    return false; // User does not exist
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return; // If form is invalid, stop OTP process

    setIsLoading(true);
    setError('');
    console.log('phone number',`${formData.countryCode} ${formData.phoneNumber}`);
    const userExists = await checkUserExists();
    if (!userExists) {

    const appVerifier = window.recaptchaVerifier;
    if (!appVerifier) {
      console.error("reCAPTCHA verifier is not ready");
      setIsLoading(false);
      return;
    }

    const completePhone = `${formData.countryCode} ${formData.phoneNumber}`;

    firebase.auth().signInWithPhoneNumber(completePhone, appVerifier)
      .then((confirmationResult) => {
        setConfirmResult(confirmationResult);
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error during signInWithPhoneNumber:", error);
        if (error.code === 'auth/billing-not-enabled' || error.code === 'auth/too-many-requests') {
          storeUserInFirestore().then(() => setIsLoading(false));
        } else {
          setError("Error during OTP request. Please try again.");
          setIsLoading(false);
        }
      });
    }else {
      setIsLoading(false); // Stop loading if user exists
    }
  };
  
  // Function to store user data in Firebase Realtime Database
  // const storeUserInRealtimeDatabase = async () => {
  //   try {
  //     const db = getDatabase();
  //     const userRef = ref(db, 'users/' + Date.now()); // Using Date.now() as a temporary user ID for now
  //     await set(userRef, {
  //       firstName: formData.firstName,
  //       lastName: formData.lastName,
  //       email: formData.email,
  //       password: formData.password,
  //       phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`,
  //     });

  //     localStorage.setItem('firstName', formData.firstName);
  //     localStorage.setItem('displayName', formData.firstName);
  //       setFirstName(formData.firstName);
  //     setUser({
  //       firstName: formData.firstName,
  //       lastName: formData.lastName,
  //       email: formData.email,
  //       password: formData.password,
  //       phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`,
  //     })
  //     console.log("User data stored in Firebase Realtime Database.");
  //     navigate('/home');
  //   } catch (error) {
  //     console.error("Error storing user data in Firebase Realtime Database:", error);
  //     setError("An error occurred while saving data.");
  //   }


  // };

  //Function to store user data in Firebase Firstore Database
  const storeUserInFirestore = async () => {
    try {
      const db = getFirestore(); // Get Firestore instance      
      // Create a reference to the user's document in the 'users' collection
      
      const userRef = doc(collection(db, 'users'));
      const userId = userRef.id;
      // Use authenticated user's ID or fallback to Date.now()
      
      // Set user data in Firestore
      await setDoc(userRef, {
        uid: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,  // Storing plain text passwords is insecure! Use Firebase Authentication for passwords.
        phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`,
        registeredDate: Timestamp.now()
      });

      const activitiesRef = collection(db, 'activities');
      await addDoc(activitiesRef, {
        timestamp: getISTDate(new Date()).toString(),
        description: `User ${formData.firstName } ${formData.lastName } registered`,
      });

      const userid = userId;
  
      // Optionally store in local storage and set context
      localStorage.setItem('firstName', formData.firstName);
      localStorage.setItem('displayName', formData.firstName);
      localStorage.setItem('uid',userid);
      setFirstName(formData.firstName);
      setUid(userid);
      setUser({
        uid: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`,
        registeredDate: Timestamp.now()
      });
  
      console.log("User data stored in Firestore.");
      navigate('/home');
    } catch (error) {
      console.error("Error storing user data in Firestore:", error);
      setError("An error occurred while saving data.");
    }
  };




  const handleOtpSubmit = (e) => {
    e.preventDefault();
  
    setIsVerifying(true);
  
    if (confirmResult && otp.length === 6) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 20000) // 20 seconds timeout
      );
  
      Promise.race([
        confirmResult.confirm(otp),
        timeoutPromise
      ])
        .then((result) => {
          const user = result.user;
          const userId = user.uid;
          
          if (!user || !user.uid) {
            throw new Error("User UID is missing or invalid.");
          }
          console.log("User UID:", user.uid);
  
          const db = getFirestore();
  
          // Create Firestore document reference using UID
          const userRef = doc(db, 'users', user.uid);
  
          return setDoc(userRef, {
            uid: userId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email || user.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            registeredDate: Timestamp.now()
          });
        })
        .then(() => {
          const db = getFirestore();
          const activitiesRef = collection(db, 'activities');
  
          return addDoc(activitiesRef, {
            timestamp: getISTDate(new Date()).toString(),
            description: `User ${formData.firstName} ${formData.lastName} registered`,
          });
        })
        .then(() => {
          localStorage.setItem('firstName', formData.firstName);
          setFirstName(formData.firstName);
          
          setIsVerified(true);
          setError('');
          setTimeout(() => {
            navigate('/home');
          }, 1000);
        })
        .catch((error) => {
          if (error.message === 'Timeout') {
            setError("Operation timed out. Please try again.");
          } else if (error.code === "auth/invalid-verification-code") {
            setError("Invalid OTP. Please try again.");
          } else if (error.code === "auth/operation-not-allowed") {
            setError("Operation not allowed. Please check your authentication settings.");
          } else {
            console.error("Error during OTP confirmation or updating profile:", error);
            setError("An error occurred. Please try again.");
          }
          setIsVerified(false);
        })
        .finally(() => {
          setIsVerifying(false);
        });
    } else {
      alert("Please enter a valid 6-digit OTP.");
    }
  };
  

  return (
    <div className="container mt-5">
  <h2 className="text-center mb-4">Phone Verification</h2>
  {showForm ? (
    <form className="needs-validation" noValidate>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input type="text"  className={`form-control ${formErrors.firstName ? 'is-invalid' : ''}`} id="firstName" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required />
            {formErrors.firstName && <div className="invalid-feedback">{formErrors.firstName}</div>}
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input type="text" className={`form-control ${formErrors.lastName ? 'is-invalid' : ''}`} id="lastName" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required />
            {formErrors.lastName && <div className="invalid-feedback">{formErrors.lastName}</div>}
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" className={`form-control ${formErrors.email ? 'is-invalid' : ''}`} id="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
          {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6 mx-auto">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" className={`form-control ${formErrors.password ? 'is-invalid' : ''}`} id="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
            {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
          </div>
        </div>
        <div className="col-md-6 mx-auto">
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`} id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} required />
            {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
          </div>
        </div>
      </div>
      <div className="form-group mb-3 col-md-6">
        <label htmlFor="phoneNumber">Phone Number</label>
        <div className="input-group">
          <div className="input-group-prepend">
            <select  className={`form-control ${formErrors.countryCode ? 'is-invalid' : ''}`} id="countryCode" name="countryCode" value={formData.countryCode} onChange={handleInputChange} required>
              <option value="+91">+91 (India)</option>
              <option value="+1">+1 (USA)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+61">+61 (Australia)</option>
              <option value="+81">+81 (Japan)</option>
              <option value="+33">+33 (France)</option>
              <option value="+49">+49 (Germany)</option>
              <option value="+39">+39 (Italy)</option>
              <option value="+55">+55 (Brazil)</option>
              <option value="+86">+86 (China)</option>
              <option value="+7">+7 (Russia)</option>
              <option value="+27">+27 (South Africa)</option>
              <option value="+82">+82 (South Korea)</option>
              <option value="+20">+20 (Egypt)</option>
              <option value="+34">+34 (Spain)</option>
              <option value="+31">+31 (Netherlands)</option>
              <option value="+52">+52 (Mexico)</option>
              <option value="+60">+60 (Malaysia)</option>
              <option value="+63">+63 (Philippines)</option>
              <option value="+62">+62 (Indonesia)</option>
              <option value="+90">+90 (Turkey)</option>
              <option value="+41">+41 (Switzerland)</option>
              <option value="+48">+48 (Poland)</option>
              <option value="+30">+30 (Greece)</option>
              <option value="+94">+94 (Sri Lanka)</option>
              <option value="+91">+91 (India)</option>
              <option value="+977">+977 (Nepal)</option>
            </select>
            {formErrors.countryCode && <div className="invalid-feedback">{formErrors.countryCode}</div>}
          </div>
          <input type="tel"  className={`form-control ${formErrors.phoneNumber ? 'is-invalid' : ''}`} id="phoneNumber" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} required />
          {formErrors.phoneNumber && <div className="invalid-feedback">{formErrors.phoneNumber}</div>}
        </div>
      </div>
      {error && <div className="text-danger mb-3">{error}</div>}
      <button type="button" className={`btn btn-send ${isLoading ? 'loading' : ''}`} id="send-otp-button" onClick={handleSendOtp} disabled={isLoading} > {isLoading && ( <div className="spinner"></div> )} {!isLoading && 'Submit'} </button>
      
    </form>
  ) : (
    <form onSubmit={handleOtpSubmit} className="needs-validation" noValidate>
    <div className="form-group mb-3">
      <label htmlFor="otp">Enter OTP</label>
      <input type="text" className="form-control" id="otp" name="otp" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
    </div>

    {error && <div className="text-danger mb-3">{error}</div>} 
    <button type="submit" className={`btn btn-success btn-block ${isVerified ? 'verified' : ''}`} disabled={isVerifying} >
      {isVerified ? (
        <>
           Verified <span className="tick-mark">✔</span>
        </>
      ) : isVerifying ? (
        'Verifying...'
      ) : (
        'Verify OTP'
      )}
    </button>
      
      </form>
  )}
</div>


  );
};

export default PhoneVerify;



















// Second Successful code
// import React, { useEffect, useState } from "react";
// import { getDatabase, ref, set } from "firebase/database";
// import firebase from "firebase/compat/app";
// import "firebase/compat/auth";
// import * as firebaseui from "firebaseui";
// import "firebaseui/dist/firebaseui.css";
// import { useNavigate } from "react-router-dom";
// import './PhoneVerify.css';

// const PhoneVerify = ({ auth, setError }) => {
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phoneNumber: ''
//   });
//   const [otp, setOtp] = useState('');
//   const [confirmResult, setConfirmResult] = useState(null);
//   const [timeout, setTimeoutState] = useState(false);
//   const [showForm, setShowForm] = useState(true); // State to show/hide the form
  
//   const navigate = useNavigate();

//   useEffect(() => {
//     const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

//     const uiConfig = {
//       signInOptions: [
//         {
//           provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
//           defaultCountry: "IN",
//           recaptchaParameters: {
//             type: "image",
//             size: "normal",
//             badge: "bottomleft",
//           },
//         },
//       ],
//       signInSuccessUrl: "/home",
//       privacyPolicyUrl: "/privacy-policy",
//       callbacks: {
//         signInSuccessWithAuthResult: async (authResult) => {
//           const user = firebase.auth().currentUser;
//           if (user) {
//             try {
//               await user.updateProfile({
//                 displayName: `${formData.firstName} ${formData.lastName}`
//               });

//               if (formData.email) {
//                 await user.updateEmail(formData.email);
//               }

//               navigate('/home');
//               return false;
//             } catch (error) {
//               console.error("Error updating profile:", error);
//               setError("Failed to update profile. Please try again.");
//               return false;
//             }
//           } else {
//             console.log('No user found for profile update.');
//             return false;
//           }
//         },
//         uiShown: () => {
//           console.log('FirebaseUI displayed');
//         },
//       },
//     };

//     const container = document.querySelector(".otp-container");
//     if (container) {
//       ui.start(".otp-container", uiConfig);
//     } else {
//       console.error("Element with class 'otp-container' not found");
//     }

//     const timerId = setTimeout(() => {
//       if (window.recaptchaVerifier) {
//         window.recaptchaVerifier.reset();
//         setError("reCAPTCHA challenge timed out. Please try again.");
//       }
//     }, 300000); // 5 minutes

//     return () => {
//       clearTimeout(timerId);
//       ui.reset();
//     };
//   }, [auth, formData, navigate, setError]);

//   useEffect(() => {
//     // Initialize reCAPTCHA
//     window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('send-otp-button', {
//       'size': 'invisible',
//       'callback': (response) => {
//         console.log('reCAPTCHA solved, allow send OTP');
//       },
//       'expired-callback': () => {
//         console.log('reCAPTCHA expired, please re-verify.');
//       }
//     });
//     return () => {
//        if (window.recaptchaVerifier) {
//       window.recaptchaVerifier.clear(); // Use clear() if reset() is not available
//     }
//     };
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSendOtp = () => {
//     if (formData.password !== formData.confirmPassword) {
//       alert("Passwords do not match.");
//       return;
//     }

//     const appVerifier = window.recaptchaVerifier;
//     if (!appVerifier) {
//       console.error("reCAPTCHA verifier is not ready");
//       return;
//     }

//     firebase.auth().signInWithPhoneNumber(formData.phoneNumber, appVerifier)
//       .then((confirmationResult) => {
//         setConfirmResult(confirmationResult);
//         setShowForm(false); // Hide form after OTP is sent
//       })
//       .catch((error) => {
//         console.error("Error during signInWithPhoneNumber:", error);
//         setError("Error during OTP request. Please try again.");
//       });
//   };
  
  
//   const handleOtpSubmit = async (e) => {
//     e.preventDefault();
//     if (confirmResult && otp.length === 6) {
//       try {
//         const result = await confirmResult.confirm(otp);
//         const user = result.user;
//         // Initialize Realtime Database
//         const db = getDatabase();
  
//         // Create a reference to the user's data in the database
//         const userRef = ref(db, 'users/' + user.uid);
  
//         // Save user data in Realtime Database
//         await set(userRef, {
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           email: formData.email || user.email,
//           password: formData.password,
//           phoneNumber: formData.phoneNumber,
//         });
  
//         navigate('/home'); // Navigate to home or another page after successful signup
//       } catch (error) {
//         if (error.code === "auth/invalid-verification-code") {
//           setError("Invalid OTP. Please try again.");
//         } else if (error.code === "auth/operation-not-allowed") {
//           setError("Operation not allowed. Please check your authentication settings.");
//         } else {
//           console.error("Error during OTP confirmation or updating profile:", error);
//           setError("An error occurred. Please try again.");
//         }
//       }
//     } else {
//       alert("Please enter a valid 6-digit OTP.");
//     }
//   };
  

//   const handleChangePhoneNumber = () => {
//     setOtp('');
//     setConfirmResult(null);
//     setShowForm(true);
//   };

//   return (
//     <div className="phone-verify-container">
//       {showForm && (
//         <div className="form-container">
//           <h2>Register</h2>
//           <form>
//             <div>
//               <label htmlFor="firstName">First Name:</label>
//               <input
//                 type="text"
//                 id="firstName"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="lastName">Last Name:</label>
//               <input
//                 type="text"
//                 id="lastName"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="email">Email:</label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="password">Password:</label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="confirmPassword">Confirm Password:</label>
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="phoneNumber">Phone Number:</label>
//               <input
//                 type="text"
//                 id="phoneNumber"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleInputChange}
//                 placeholder="Enter phone number with country code"
//                 required
//               />
//             </div>
//             <button id="send-otp-button" type="button" onClick={handleSendOtp}>Send OTP</button>
//           </form>
//         </div>
//       )}
//       {!showForm && (
//         <div className="otp-container">
//           {timeout && <div className="error-message">Your OTP has expired. Please request a new one.</div>}
//           <form onSubmit={handleOtpSubmit}>
//             <label htmlFor="otp">Enter OTP:</label>
//             <input
//               type="text"
//               id="otp"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               required
//             />
//             <button type="submit">Verify OTP</button>
//             <button type="button" onClick={handleChangePhoneNumber}>Back</button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PhoneVerify;

















// First successful code
// import React, { useEffect, useState } from "react";
// import firebase from "firebase/compat/app";
// import * as firebaseui from "firebaseui";
// import "firebaseui/dist/firebaseui.css";
// import { useNavigate } from "react-router-dom";
// import './PhoneVerify.css'; // Import CSS if needed

// const PhoneVerify = ({ auth, registrationData, setError }) => {
  
//   const [timeout, setTimeoutState] = useState(false);
//   const navigate = useNavigate(); // Hook for navigation

//   useEffect(() => {
//     console.log("PhoneVerify component mounted");
//     console.log("Registration data received in PhoneVerify:", registrationData);
//     const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

//     const uiConfig = {
//       signInOptions: [
//         {
//           provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
//           defaultCountry: "IN",
//           recaptchaParameters: {
//             type: "image",
//             size: "normal",
//             badge: "bottomleft",
//           },
//         },
//       ],
//       signInSuccessUrl: "/home", // FirebaseUI will handle this URL
//       privacyPolicyUrl: "/privacy-policy",
//       callbacks: {
//         signInSuccessWithAuthResult: async (authResult) => {
//           // Add additional user information to the profile
//           console.log('signInSuccessWithAuthResult callback triggered');
//           const user = firebase.auth().currentUser;
//           if (user) {
//             console.log('Current User:', user);
//             try {
//               // Update the user profile with the first and last name
//               await user.updateProfile({
//                 displayName: `${registrationData.firstName} ${registrationData.lastName}`
//               });

//               if (registrationData.email) {
//                 await user.updateEmail(registrationData.email);
//               }

//               console.log('User profile updated successfully');
//               navigate('/home');
//               return false; // Prevent default redirection
//             } catch (error) {
//               console.error("Error updating profile:", error);
//               setError("Failed to update profile. Please try again.");
//               return false; // Prevent default redirection
//             }
//           }else{
//             console.log('No user found for profile update.');
//             return false;
//           }
          
//         },
//         uiShown: () => {
//           console.log('FirebaseUI displayed');
//         },
//       },
//     };

//     try {
//       ui.start(".otp-container", uiConfig);
//     } catch (error) {
//       console.error("Error initializing FirebaseUI:", error);
//       setError("Error initializing FirebaseUI. Please try again.");
//     }

//     const timerId = setTimeout(() => {
//       setTimeoutState(true);
//       ui.reset();
//     }, 300000); // 5 minutes

//     return () => {
//       clearTimeout(timerId);
//       ui.reset();
//     };
//   }, [auth, registrationData, navigate, setError]); // Add navigate to dependencies

//   return (
//     <div className="otp-container">
//       {timeout && <div className="error-message">Your OTP has expired. Please request a new one.</div>}
      
//     </div>
//   );
// };

// export default PhoneVerify;
