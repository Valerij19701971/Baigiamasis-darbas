import React, { useState } from 'react';
import './DonateForm.css'; // Create this CSS file

function DonateForm({ campaignId, campaignTitle, onClose, onDonationSuccess }) {
    const [amount, setAmount] = useState('');
    const [donorName, setDonorName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Basic validation
        if (!donorName) {
             setError('Prašome įvesti savo vardą.');
             setLoading(false);
             return;
        }
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            setError('Aukojama suma turi būti teigiamas skaičius.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    campaign_id: campaignId,
                    amount: parseFloat(amount),
                    donor_name: donorName,
                    message: message,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                 setError(data.error || `Klaida: ${response.statusText}`);
                 throw new Error(data.error || `HTTP klaida! Būsena: ${response.status}`);
            } else {
                setSuccess('Dėkojame už Jūsų dosnią auką!');
                setAmount(''); // Clear form
                setDonorName('');
                setMessage('');
                // Notify parent component (App.jsx) to refresh campaign list
                if (onDonationSuccess) {
                    onDonationSuccess(); 
                }
                // Close modal after a delay
                setTimeout(() => onClose(), 2000); 
            }
        } catch (err) {
            console.error('Donation fetch error:', err);
            if (!error) { // Avoid overwriting specific error from response
                 setError('Nepavyko apdoroti aukojimo. Bandykite dar kartą.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="donate-form-container">
            <h2>Aukoti: {campaignTitle}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="donorName">Jūsų Vardas *</label>
                    <input
                        id="donorName"
                        type="text"
                        placeholder="Įveskite savo vardą"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                 <div className="form-group">
                    <label htmlFor="amount">Suma (€) *</label>
                    <input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={loading}
                        min="0.01" 
                        step="0.01"
                        required
                    />
                </div>
                <div className="form-group">
                     <label htmlFor="message">Nebūtina Žinutė</label>
                    <textarea
                        id="message"
                        placeholder="Palikite palaikymo žinutę (nebūtina)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading}
                        rows="3"
                    />
                </div>
                                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Apdorojama...' : 'Aukoti Dabar'}
                </button>
            </form>
        </div>
    );
}

export default DonateForm; 