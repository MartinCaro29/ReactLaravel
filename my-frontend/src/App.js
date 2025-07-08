import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserList from './components/UserList';

import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import {AuthProvider, useAuth} from "./components/AuthContext";
import ForgotPassword from "./components/ForgotPassword";
import LandingPage from "./components/LandingPage";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import AuthRedirect from "./components/AuthRedirect";
import WorkerTimeList from "./components/WorkerTimeList";

const App = () => {


    return (
        <AuthProvider>


            <Routes>
                <Route path="/" element={<LandingPage/>} />


                <Route path="/login" element={
                    <AuthRedirect>
                        <Login />

                    </AuthRedirect>
                } />

                <Route path="/register" element={
                    <AuthRedirect>
                        <Register />

                    </AuthRedirect>
                } />
                <Route path="/forgotpassword" element={<ForgotPassword/>} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <UserList />

                    </ProtectedRoute>
                } />

                <Route path="/workers" element={
                    <ProtectedRoute>
                        <WorkerTimeList />

                    </ProtectedRoute>
                } />
            </Routes>


            </AuthProvider>
    );
};

export default App;
