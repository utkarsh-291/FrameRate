import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password
            });

            localStorage.setItem('token', response.data.token);

            alert("Login successful");
            navigate('/dashboard');
        } catch (err) {
            alert("Login failed");
        }
    };
}

export default Login;