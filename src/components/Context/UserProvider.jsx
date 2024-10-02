import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // Adjust the import as needed
import { getDatabase, ref, get } from 'firebase/database';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState(() => localStorage.getItem('firstName') || '');
  const [uid, setUid] = useState(() => localStorage.getItem('uid') || '');
  const [displayName, setDisplayName] = useState('');
  const [cartCount, setCartCount] = useState(() => Number(localStorage.getItem('cartCount')) || 0); // Initialize cart count

  useEffect(() => {
    const loadUserFromLocalStorage = () => {
      const storedFirstName = localStorage.getItem('firstName');
      const storedDisplayName = localStorage.getItem('displayName');
      const storedUid = localStorage.getItem('uid');
      if (storedFirstName) {
        setFirstName(storedFirstName);
      }
      if (storedDisplayName) {
        setDisplayName(storedDisplayName);
      }
      if(storedUid){
        setUid(storedUid);
      }
    };

    loadUserFromLocalStorage();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("Current User ID:", currentUser.uid);
        setUser(currentUser);
        setDisplayName(currentUser.displayName||'');
        console.log("set display name : ",currentUser.displayName);
        const db = getDatabase();
        
        const userRef = ref(db, 'users/' + currentUser.uid);
        console.log("User Ref:",userRef);
        
        try {
          const snapshot = await get(userRef);
          console.log("Snapshot",snapshot.exists());
          if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("User Data from DB:", userData);
            setFirstName(userData.firstName); 
            localStorage.setItem('firstName', userData.firstName);
            setUid(userData.uid);
            localStorage.setItem('uid', userData.uid);
            console.log("uid,",userData.uid);
            setUser(currentUser);
            console.log("Current user:", currentUser);
          } else {
            if(currentUser){
              setUser(currentUser);
              setDisplayName(currentUser.displayName);
              setUid(currentUser.uid);
              console.log("user in else block ",user);
              console.log("user firstname in else block",displayName);
            }else{
              console.log("No user is logged in");
              
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        
        console.error("NO user found!!!");
      }
    });

    return () => unsubscribe();
  }, [displayName, user, uid]);

    // Function to update cart count
  const updateCartCount = (newCount) => {
    setCartCount(newCount);
    localStorage.setItem('cartCount', newCount);
  };

  return (
    <UserContext.Provider value={{ user, setUser, firstName, setFirstName, displayName, setUid, uid, cartCount, updateCartCount }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export { UserContext };