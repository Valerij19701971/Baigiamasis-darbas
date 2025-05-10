import React, { useState } from 'react';
import './CreateCampaignForm.css'; // Create this CSS file

function CreateCampaignForm({ onClose }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goalAmount, setGoalAmount] = useState('');
    const [category, setCategory] = useState('');
    const [imageFile, setImageFile] = useState(null); // State for the file object
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        } else {
            setImageFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const userToken = localStorage.getItem('userToken'); // Get the user token
        if (!userToken) {
            setError('Norėdami sukurti kampaniją, turite būti prisijungę.'); // Translated
            setLoading(false);
            return;
        }

        // Basic frontend validation
        if (!title || !description || !goalAmount || !category) {
            setError('Prašome užpildyti visus privalomus laukus.'); // Translated
            setLoading(false);
            return;
        }
        if (isNaN(parseFloat(goalAmount)) || parseFloat(goalAmount) <= 0) {
            setError('Tikslinė suma turi būti teigiamas skaičius.'); // Translated
            setLoading(false);
            return;
        }

        // Create FormData
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('goal_amount', parseFloat(goalAmount));
        formData.append('category', category);
        if (imageFile) {
            formData.append('campaignImage', imageFile); // Key must match upload.single() in backend
        }

        try {
            const response = await fetch('http://localhost:8000/api/campaigns', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}` 
                },
                body: formData, // Send FormData directly
            });

            const data = await response.json();

            if (!response.ok) {
                 setError(data.error || `Klaida: ${response.statusText}`); // Translated
                 throw new Error(data.error || `HTTP klaida! Būsena: ${response.status}`); // Translated
            } else {
                setSuccess('Kampanija sėkmingai pateikta! Laukiama administratoriaus patvirtinimo.'); // Translated
                // Clear form
                setTitle('');
                setDescription('');
                setGoalAmount('');
                setCategory('');
                setImageFile(null); // Clear file state
                // Optionally clear file input visually if needed (can be tricky)
                // e.target.reset(); // Or reset specific file input ref
                
                setTimeout(() => onClose(), 2500);
            }
        } catch (err) {
            console.error('Create campaign fetch error:', err);
            if (!error) { // Avoid overwriting specific error from response
                 setError('Nepavyko pateikti kampanijos. Bandykite dar kartą.'); // Translated
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-campaign-container">
            <h2>Pradėti Naują Kampaniją</h2> {/* Translated */}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Projekto Pavadinimas *</label> {/* Translated */}
                    <input
                        id="title"
                        type="text"
                        placeholder="Sugalvokite patrauklų kampanijos pavadinimą" // Translated
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                <div className="form-group">
                     <label htmlFor="description">Projekto Aprašymas *</label> {/* Translated */}
                    <textarea
                        id="description"
                        placeholder="Papasakokite apie savo projektą..." // Translated
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                        rows="4"
                        required
                    />
                </div>
                 <div className="form-group">
                    <label htmlFor="goalAmount">Tikslinė Suma (€) *</label> {/* Translated */}
                    <input
                        id="goalAmount"
                        type="number"
                        placeholder="0.00"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(e.target.value)}
                        disabled={loading}
                        min="1" 
                        step="0.01"
                        required
                    />
                </div>
                 <div className="form-group">
                    <label htmlFor="category">Kategorija *</label> {/* Translated */}
                    <input
                        id="category"
                        type="text"
                        placeholder="pvz., Technologijos, Bendruomenė, Menas" // Translated
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                
                {/* Image File Input */}
                <div className="form-group">
                    <label htmlFor="campaignImage">Projekto Nuotrauka</label> {/* Translated */}
                    <input
                        id="campaignImage"
                        type="file"        // Changed type to file
                        accept="image/*"   // Suggest only image files
                        onChange={handleFileChange} // Use new handler
                        disabled={loading}
                    />
                     {/* Optional: Preview selected image */} 
                     {imageFile && <img src={URL.createObjectURL(imageFile)} alt="Peržiūra" style={{maxWidth: '100px', marginTop: '10px'}} />} {/* Translated alt */}
                </div>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Pateikiama...' : 'Pateikti Kampaniją Tvirtinimui'} {/* Translated */}
                </button>
            </form>
        </div>
    );
}

export default CreateCampaignForm; 