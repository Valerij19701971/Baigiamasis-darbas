import React, { useState } from 'react';
import './AdminLogin.css'; // Reuse admin login styles for now

function UserLogin({ onLogin }) { // Changed component name and props
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Attempting user login to: http://localhost:8000/api/login');
            const response = await fetch('http://localhost:8000/api/login', { // Changed endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('User Login Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('User login failed response text:', errorText);
                // Try to parse error JSON if possible
                let errorJson = {};
                try { errorJson = JSON.parse(errorText); } catch(parseErr) {}
                setError(errorJson.error === 'Invalid credentials' ? 'Neteisingi prisijungimo duomenys' : (errorJson.error || `Prisijungti nepavyko: ${response.statusText || response.status}`));
                throw new Error(`HTTP error! status: ${response.status}`); 
            }
            
            const data = await response.json();
            console.log('User Login Response data:', data);

            if (data.token && data.user) { // Check for user data too
                localStorage.setItem('userToken', data.token); // Use different token key
                localStorage.setItem('currentUser', JSON.stringify(data.user)); // Store user info
                onLogin(data.user); // Pass user data back on success
            } else {
                setError('Neteisingas serverio atsakymas (nėra token/vartotojo)');
            }
        } catch (err) {
            // Error already set if it was an HTTP error, otherwise set generic
            if (!error) {
                 console.error('User Login fetch/processing error:', err);
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
        // Reuse the admin-login class or create a new one if desired
        <div className="admin-login"> 
            <h2>Vartotojo Prisijungimas</h2> {/* Translated */}
            <form onSubmit={handleSubmit}>
                 {/* Form inputs remain the same */}
                 <div className="form-group">
                    <input
                        type="text"
                        placeholder="Vartotojo vardas" // Translated
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Slaptažodis" // Translated
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Jungiamasi...' : 'Prisijungti'} {/* Translated */}
                </button>
            </form>
        </div>
    );
}

export default UserLogin; // Changed export name 