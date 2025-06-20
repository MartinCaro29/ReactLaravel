import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserList from './components/UserList';
import UserDetails from './components/UserDetails';
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import {AuthProvider} from "./components/AuthContext";
import ForgotPassword from "./components/ForgotPassword";
import LandingPage from "./components/LandingPage";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

const App = () => {
    return (
        <AuthProvider>
            <Navigation/>

            <Routes>
                <Route path="/" element={<LandingPage/>} />
                <Route path="/user/:id" element={<UserDetails />} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/forgotpassword" element={<ForgotPassword/>} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <UserList />
                    </ProtectedRoute>
                } />
            </Routes>

            <Footer/>
            </AuthProvider>
    );
};

export default App;
