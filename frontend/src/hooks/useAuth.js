 // src/hooks/useAuth.js
 import { useContext } from 'react';
 import { AuthContext } from '../context/AuthContext';
 
 export const useAuth = () => {
   const context = useContext(AuthContext);
 
   if (!context) {
     throw new Error('useAuth must be used within an AuthProvider');
   }
 
   // Helper functions to work with localStorage
   const setTokenInStorage = (token) => {
     if (token) {
       localStorage.setItem('token', token);
     } else {
       localStorage.removeItem('token');
     }
   };
   const getToken = () => localStorage.getItem('token');
 
   const setUserInStorage = (user) => {
     if (user) {
       localStorage.setItem('user', JSON.stringify(user));
     } else {
       localStorage.removeItem('user');
     }
   };
 
   // Enhanced auth methods
   const enhancedLogin = async (data) => {
     try {
       // Store token and user data
       setTokenInStorage(data.token);
       setUserInStorage(data.user);
 
       // Update context
       if (context.login) {
         await context.login(data);
       }
 
       return data;
     } catch (error) {
       // Clean up storage in case of error
       localStorage.removeItem('token');
       localStorage.removeItem('user');
       throw error;
     }
   };
 
   const enhancedLogout = () => {
     // Clear storage
     localStorage.removeItem('token');
     localStorage.removeItem('user');
 
     // Call context logout
     if (context.logout) {
       context.logout();
     }
   };
 
   // Get current auth status
   const isAuthenticated = !!context.user;
   const isAdmin = context.user?.isAdmin || false;
 
   return {
     ...context,
     login: enhancedLogin,
     logout: enhancedLogout,
     isAuthenticated,
     isAdmin,
     getToken: () => localStorage.getItem('token'),
     getUser: () => {
       const userStr = localStorage.getItem('user');
       try {
         return userStr ? JSON.parse(userStr) : null;
       } catch {
         return null;
       }
     }
   };
 };
 
 export default useAuth;