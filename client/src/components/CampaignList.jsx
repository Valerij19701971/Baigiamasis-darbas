import React, { useState, useEffect } from 'react';
import CampaignCard from './CampaignCard.jsx';
import './CampaignList.css';

function CampaignList({ onDonateClick }) {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampaigns = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/campaigns');
            if (!response.ok) {
                throw new Error(`HTTP klaida! Būsena: ${response.status}`);
            }
            const data = await response.json();
            setCampaigns(data);
        } catch (err) {
            console.error("Nepavyko gauti kampanijų:", err);
            setError('Nepavyko įkelti kampanijų. Bandykite vėliau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const { activeCampaigns, fullyFundedCampaigns } = React.useMemo(() => {
        const active = [];
        const funded = [];
        campaigns.forEach(campaign => {
            const goal = parseFloat(campaign.goal_amount) || 0;
            const current = parseFloat(campaign.current_amount) || 0;
            if (current >= goal) {
                funded.push(campaign);
            } else {
                active.push(campaign);
            }
        });
        return { activeCampaigns: active, fullyFundedCampaigns: funded };
    }, [campaigns]);

    if (loading) {
        return <div className="campaign-list-status">Kraunamos kampanijos...</div>;
    }

    if (error) {
        return <div className="campaign-list-status error">{error}</div>;
    }

    return (
        <div className="campaign-list-container">
            
            {activeCampaigns.length > 0 ? (
                <>
                    <h2>Aktyvios Kampanijos</h2>
                    <div className="campaign-grid">
                        {activeCampaigns.map(campaign => (
                            <CampaignCard 
                                key={campaign.id} 
                                campaign={campaign} 
                                onDonateClick={onDonateClick} 
                            />
                        ))}
                    </div>
                </>
            ) : (
                
                fullyFundedCampaigns.length === 0 && !loading && 
                <div className="campaign-list-status">Aktyvių kampanijų nerasta.</div> 
            )}

            
            {fullyFundedCampaigns.length > 0 && (
                <>
                    <h2 className="fully-funded-header">Pilnai Finansuotos Kampanijos</h2>
                    <div className="campaign-grid fully-funded-grid">
                         {fullyFundedCampaigns.map(campaign => (
                            <CampaignCard 
                                key={campaign.id} 
                                campaign={campaign} 
                                
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default CampaignList;