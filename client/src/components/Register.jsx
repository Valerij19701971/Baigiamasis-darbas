import React, { useState } from 'react';
import './Register.css'; // We'll create this next

function Register({ onRegisterSuccess }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (password.length < 6) {
            setError('Slaptažodis turi būti bent 6 simbolių ilgio');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                let translatedError = data.error;
                if (data.error === 'Username already exists') translatedError = 'Vartotojo vardas jau užimtas';
                else if (data.error === 'Email already exists') translatedError = 'El. paštas jau užimtas';
                else if (data.error === 'Username, email, and password are required') translatedError = 'Vartotojo vardas, el. paštas ir slaptažodis yra privalomi';
                
                setError(translatedError || `Registracija nepavyko: ${response.statusText}`);
            } else {
                setSuccess('Registracija sėkminga! Dabar galite prisijungti.');
                setUsername('');
                setEmail('');
                setPassword('');
                if (onRegisterSuccess) {
                    setTimeout(() => onRegisterSuccess(), 2000); 
                }
            }
        } catch (err) {
            console.error('Registration fetch error:', err);
            setError('Nepavyko prisijungti prie serverio. Bandykite dar kartą.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Registruotis</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Vartotojo vardas"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="email"
                        placeholder="El. paštas"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Slaptažodis (min. 6 simboliai)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Registruojama...' : 'Registruotis'}
                </button>
            </form>
        </div>
    );
}

export default Register; 