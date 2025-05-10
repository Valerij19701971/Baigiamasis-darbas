import React, { useState } from 'react';
import './AdminLogin.css';

function AdminLogin({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Attempting login to: http://localhost:8000/api/admin/login');
            const response = await fetch('http://localhost:8000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text(); 
                console.error('Login failed response text:', errorText);
                let errorJson = {};
                try { errorJson = JSON.parse(errorText); } catch(parseErr) {}
                setError(errorJson.error === 'Invalid credentials' ? 'Neteisingi prisijungimo duomenys' : (errorJson.error || 'Prisijungti nepavyko'));
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);

            if (data.token) {
                localStorage.setItem('adminToken', data.token);
                onLogin(true);
            } else {
                setError('Neteisingas serverio atsakymas (nėra token)');
            }
        } catch (err) {
            console.error('Login fetch/processing error:', err);
            if (!error) {
                if (err.message.includes('Failed to fetch')) {
                    setError('Nepavyko prisijungti prie serverio. Įsitikinkite, kad jis veikia ir yra pasiekiamas.');
                } else {
                    setError(`Prisijungti nepavyko: ${err.message}`);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <h2>Admin Prisijungimas</h2>
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
                        type="password"
                        placeholder="Slaptažodis"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Jungiamasi...' : 'Prisijungti'}
                </button>
            </form>
        </div>
    );
}

export default AdminLogin; 