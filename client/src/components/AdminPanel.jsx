import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import EditCampaignModal from './EditCampaignModal.JSX'; // Import the new modal

// Helper to translate status
const translateStatus = (status) => {
    switch (status) {
        case 'pending': return 'Laukia';
        case 'approved': return 'Patvirtinta';
        case 'rejected': return 'Atmesta';
        default: return status;
    }
};

function AdminPanel() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Added error state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        setError(null); // Reset error on fetch
        try {
            console.log('Fetching campaigns from: http://localhost:8000/api/admin/campaigns');
            const response = await fetch('http://localhost:8000/api/admin/campaigns', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (!response.ok) {
                 const errorText = await response.text();
                 setError(`Klaida gaunant kampanijas: ${response.statusText || response.status}`); // Translated
                 throw new Error(`HTTP error fetching campaigns! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            setCampaigns(data);
        } catch (err) {
            console.error('Error fetching campaigns:', err);
            if (!error) setError('Nepavyko gauti kampanijų sąrašo.'); // Translated generic error
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (campaignId, newStatus) => {
        setError(null); // Reset error before action
        try {
            console.log(`Updating campaign ${campaignId} status to ${newStatus} at: http://localhost:8000/api/admin/campaigns/${campaignId}/status`);
            const response = await fetch(`http://localhost:8000/api/admin/campaigns/${campaignId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                 const errorText = await response.text();
                 setError(`Klaida atnaujinant būseną: ${response.statusText || response.status}`); // Translated
                 throw new Error(`HTTP error updating status! status: ${response.status} - ${errorText}`);
            }
            // No need to check response.ok again, handled above
            fetchCampaigns(); // Refetch campaigns after successful update
            
        } catch (err) {
            console.error('Error updating campaign status:', err);
            if (!error) setError('Nepavyko atnaujinti kampanijos būsenos.'); // Translated generic error
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        setError(null);
        // Optional: Add a confirmation dialog before deleting
        // if (!window.confirm('Ar tikrai norite ištrinti šią kampaniją? Šis veiksmas negali būti anuliuotas.')) {
        //     return;
        // }

        try {
            console.log(`Deleting campaign ${campaignId} at: http://localhost:8000/api/admin/campaigns/${campaignId}`);
            const response = await fetch(`http://localhost:8000/api/admin/campaigns/${campaignId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                const parsedError = JSON.parse(errorText); // Assuming error is JSON
                setError(parsedError.error || `Klaida trinant kampaniją: ${response.statusText || response.status}`); // Translated
                throw new Error(`HTTP error deleting campaign! status: ${response.status} - ${errorText}`);
            }
            
            // If deletion is successful, refetch campaigns to update the list
            fetchCampaigns(); 
            // Optionally, show a success message
            // alert('Kampanija sėkmingai ištrinta.'); // Basic alert, consider a more integrated notification

        } catch (err) {
            console.error('Error deleting campaign:', err);
            if (!error) setError('Nepavyko ištrinti kampanijos.'); // Translated generic error
        }
    };

    const openEditModal = (campaign) => {
        setEditingCampaign(campaign);
        setIsEditModalOpen(true);
        setError(null); // Clear previous errors when opening modal
    };

    const closeEditModal = () => {
        setEditingCampaign(null);
        setIsEditModalOpen(false);
    };

    const handleUpdateCampaign = async (campaignId, updatedData) => {
        setError(null);
        // setLoading(true); // Consider a separate loading state for the modal or use a general one
        try {
            console.log(`Updating campaign ${campaignId} with data:`, updatedData);
            const response = await fetch(`http://localhost:8000/api/admin/campaigns/${campaignId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || `Klaida atnaujinant kampaniją: ${response.statusText || response.status}`;
                setError(errorMessage);
                throw new Error(`HTTP error updating campaign! status: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            
            closeEditModal();
            fetchCampaigns(); // Refetch campaigns to show updated data
            // Optionally, show a success message

        } catch (err) {
            console.error('Error updating campaign:', err);
            // The error state in the modal might be set by the modal itself if it has its own error handling.
            // If not, or to ensure AdminPanel shows an error, set it here.
            if (!error) setError(err.message || 'Nepavyko atnaujinti kampanijos.');
            // Do not close modal on error, so user can see the error message in modal
            // throw err; // Re-throw if modal needs to catch it for its own state
        }
        // finally {
        //     setLoading(false);
        // }
    };

    if (loading && !isEditModalOpen) { // Don't show main loading if edit modal is active and might have its own
        return <div className="loading">Kraunama...</div>; // Translated
    }

    return (
        <div className="admin-panel">
            <h2>Admin Valdymas - Kampanijų Tvarkymas</h2> {/* Translated */}
            {error && <div className="error-message admin-error">{error}</div>} {/* Display error */} 
            <div className="campaigns-list">
                {campaigns.length === 0 && !loading && !error && <p>Nėra kampanijų peržiūrai.</p>} {/* Translated empty state */}
                {campaigns.map(campaign => (
                    <div key={campaign.id} className="campaign-item">
                        <h3>{campaign.title}</h3>
                        <p>{campaign.description || 'Aprašymo nėra'}</p> {/* Translated */} 
                        <div className="campaign-details">
                            <span>Tikslas: {parseFloat(campaign.goal_amount || 0).toFixed(2)} €</span> {/* Translated */}
                            <span>Kategorija: {campaign.category || '-'}</span> {/* Translated */}
                            <span>Būsena: {translateStatus(campaign.status)}</span> {/* Translated status */}
                        </div>
                        <div className="campaign-actions">
                            {campaign.status === 'pending' && (
                                <>
                                    <button 
                                        onClick={() => handleStatusChange(campaign.id, 'approved')}
                                        className="approve-btn"
                                    >
                                        Patvirtinti {/* Translated */}
                                    </button>
                                    <button 
                                        onClick={() => handleStatusChange(campaign.id, 'rejected')}
                                        className="reject-btn"
                                    >
                                        Atmesti {/* Translated */}
                                    </button>
                                </>
                            )}
                            {/* Edit Button - visible for all statuses */}
                            <button 
                                onClick={() => openEditModal(campaign)} 
                                className="edit-btn" // Add a new class for styling
                            >
                                Redaguoti {/* Translated */}
                            </button>
                            {/* Delete Button - visible for all statuses */}
                            <button
                                onClick={() => handleDeleteCampaign(campaign.id)}
                                className="delete-btn" // Add a new class for styling
                            >
                                Ištrinti {/* Translated */}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {editingCampaign && (
                <EditCampaignModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    campaignData={editingCampaign}
                    onSave={handleUpdateCampaign} 
                />
            )}
        </div>
    );
}

export default AdminPanel; 
