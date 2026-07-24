import React, { useState } from 'react';
import axios from 'axios';
import { Form } from 'react-router-dom';

function Register() {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                email,
                password
            });
            alert(response.data.message);
        } catch (err) {
            console.error(err);
            alert("Registration failed!");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Register</h1>
            <input 
                type="email"
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                type="password" 
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type='submit'>Register</button>
        </form>
    );
}

export default Register;