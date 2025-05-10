import React, { useState, useEffect } from 'react';
import './Modal.css'; // Assuming a generic Modal.css exists and can be reused/adapted
import './CreateCampaignForm.css'; // Reusing styles from CreateCampaignForm for now

function EditCampaignModal({ isOpen, onClose, campaignData, onSave }) {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (campaignData) {
            setFormData({
                title: campaignData.title || '',
                description: campaignData.description || '',
                goal_amount: campaignData.goal_amount || '',
                category: campaignData.category || '',
            });
        } else {
            // Reset form if no campaign data (e.g., modal closed and reopened without data)
            setFormData({ title: '', description: '', goal_amount: '', category: '' });
        }
        setError(''); // Clear errors when campaign data changes or modal opens/closes
    }, [campaignData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic frontend validation (similar to CreateCampaignForm)
        if (!formData.title || !formData.description || !formData.goal_amount || !formData.category) {
            setError('Prašome užpildyti visus privalomus laukus.');
            setLoading(false);
            return;
        }
        if (isNaN(parseFloat(formData.goal_amount)) || parseFloat(formData.goal_amount) <= 0) {
            setError('Tikslinė suma turi būti teigiamas skaičius.');
            setLoading(false);
            return;
        }

        try {
            // The actual save logic will be passed via onSave prop from AdminPanel
            await onSave(campaignData.id, formData);
            // onClose(); // AdminPanel will handle closing and refetching
        } catch (err) {
            // Error handling will be managed by the onSave function passed from AdminPanel
            // or display a generic error here if onSave doesn't handle it directly for the modal
            setError(err.message || 'Nepavyko išsaugoti pakeitimų. Bandykite dar kartą.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content create-campaign-container"> {/* Reusing some CSS classes */}
                <h2>Redaguoti Kampaniją</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Projekto Pavadinimas *</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Projekto Aprašymas *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={loading}
                            rows="4"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="goal_amount">Tikslinė Suma (€) *</label>
                        <input
                            id="goal_amount"
                            name="goal_amount"
                            type="number"
                            value={formData.goal_amount}
                            onChange={handleChange}
                            disabled={loading}
                            min="1"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Kategorija *</label>
                        <input
                            id="category"
                            name="category"
                            type="text"
                            value={formData.category}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="modal-actions">
                        <button type="submit" className="button-primary" disabled={loading}>
                            {loading ? 'Saugoma...' : 'Išsaugoti Pakeitimus'}
                        </button>
                        <button type="button" className="button-secondary" onClick={onClose} disabled={loading}>
                            Atšaukti
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditCampaignModal; 
