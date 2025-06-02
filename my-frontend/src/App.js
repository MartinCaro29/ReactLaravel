import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserList from './components/UserList';
import UserDetails from './components/UserDetails';
import Login from "./components/Login";
import Register from "./components/Register";

const App = () => {
    return (

            <Routes>
                <Route path="/" element={<UserList />} />
                <Route path="/user/:id" element={<UserDetails />} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
            </Routes>

    );
};

export default App;
