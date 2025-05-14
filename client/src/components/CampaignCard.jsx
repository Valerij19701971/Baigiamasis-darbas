import React, { useState, useEffect } from 'react';
import './CampaignCard.css';

// Accept onDonateClick prop
function CampaignCard({ campaign, onDonateClick }) {
    const { id, title, description, image_url } = campaign;
    const [recentDonations, setRecentDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Convert amounts from string (likely) to numbers
    const goalAmountNum = parseFloat(campaign.goal_amount) || 0;
    const currentAmountNum = parseFloat(campaign.current_amount) || 0;

    // Calculate funding percentage using numbers
    const percentage = goalAmountNum > 0 ? Math.min((currentAmountNum / goalAmountNum) * 100, 100) : 0;

    // Use a placeholder image if image_url is missing or invalid
    const displayImageUrl = image_url ? `http://localhost:8000${image_url}` : 'https://via.placeholder.com/300x200.png?text=Nėra+Nuotraukos';

    const isFullyFunded = currentAmountNum >= goalAmountNum;

    // Fetch recent donations for this campaign
    useEffect(() => {
        const fetchDonations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/campaigns/${id}/donations`);
                if (response.ok) {
                    const data = await response.json();
                    // Only show up to 3 most recent donations
                    setRecentDonations(data.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching donations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDonations();
    }, [id]);

    return (
        // Add class if fully funded
        <div className={`campaign-card ${isFullyFunded ? 'fully-funded' : ''}`}>
            <img 
                src={displayImageUrl} 
                alt={title} 
                className="campaign-image" 
                onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/300x200.png?text=Nuotraukos+Klaida'; }} // Translated error placeholder
            />
            <div className="campaign-content">
                <h3 className="campaign-title">{title}</h3>
                <p className="campaign-description">{description ? description.substring(0, 400) + (description.length > 400 ? '...' : '') : 'Aprašymas nepateiktas.'}</p>
                
                {/* Recent donations section */}
                {recentDonations.length > 0 && (
                    <div className="recent-donations">
                        <h4>Paskutiniai rėmėjai:</h4>
                        <ul className="donations-list">
                            {recentDonations.map(donation => (
                                <li key={donation.id} className="donation-item">
                                    <span className="donor-name">{donation.donor_name}</span>
                                    <span className="donation-amount">{parseFloat(donation.amount).toFixed(2)} €</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="campaign-funding">
                    <div className="campaign-progress-bar">
                        <div 
                            className="campaign-progress-fill"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    <p className="campaign-amounts">
                        <span className="current-amount">{currentAmountNum.toFixed(2)} € surinkta</span> iš 
                        <span className="goal-amount"> {goalAmountNum.toFixed(2)} € tikslo</span>
                    </p>
                    {/* Show Donate button only if not fully funded */}
                    {!isFullyFunded && (
                         <button 
                            className="donate-button" 
                            onClick={() => onDonateClick(id, title)} // Pass id and title
                         >
                             Aukoti
                         </button>
                    )}
                    {isFullyFunded && <p className="fully-funded-message">Pilnai Finansuota!</p>}
                </div>
            </div>
        </div>
    );
}

export default CampaignCard; 
