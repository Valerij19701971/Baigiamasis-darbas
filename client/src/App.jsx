import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation.jsx';
import Banner from './components/Banner.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import UserLogin from './components/UserLogin.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import Register from './components/Register.jsx';
import Modal from './components/Modal.jsx';
import CreateCampaignForm from './components/CreateCampaignForm.jsx';
import CampaignList from './components/CampaignList.jsx';
import DonateForm from './components/DonateForm.jsx';
import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState(null);
  const [refreshCampaignsKey, setRefreshCampaignsKey] = useState(0);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAdmin(true);
    }
    const userToken = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('currentUser');
    if (userToken && storedUser) {
        try {
           setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Error parsing stored user data:", e);
            localStorage.removeItem('userToken');
            localStorage.removeItem('currentUser');
        }
    }
  }, []);

  const openLoginModal = () => {
    closeAllModals();
    setIsLoginModalOpen(true);
  }
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openAdminLoginModal = () => {
    closeAllModals();
    setIsAdminLoginModalOpen(true);
  }
  const closeAdminLoginModal = () => setIsAdminLoginModalOpen(false);

  const openRegisterModal = () => {
    closeAllModals();
    setIsRegisterModalOpen(true);
  }
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  const openCreateModal = () => {
    if (!isLoggedIn) {
        openLoginModal();
        return; 
    }
    closeAllModals();
    setIsCreateModalOpen(true);
  }
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openDonateModal = (campaignId, campaignTitle) => {
      setSelectedCampaignForDonation({ id: campaignId, title: campaignTitle });
      closeAllModals();
      setIsDonateModalOpen(true);
  }
  const closeDonateModal = () => {
      setIsDonateModalOpen(false);
      setSelectedCampaignForDonation(null);
  }

  const closeAllModals = () => {
      setIsLoginModalOpen(false);
      setIsAdminLoginModalOpen(false);
      setIsRegisterModalOpen(false);
      setIsCreateModalOpen(false);
      setIsDonateModalOpen(false);
  }

  const handleAdminLoginSuccess = (isAdminSuccess) => {
    setIsAdmin(isAdminSuccess);
    closeAdminLoginModal();
    if(isAdminSuccess) setCurrentUser(null);
  };

  const handleUserLoginSuccess = (userData) => {
    setCurrentUser(userData);
    closeLoginModal();
    if(userData) setIsAdmin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    setIsAdmin(false);
    setCurrentUser(null);
  };

  const isLoggedIn = !!currentUser;

  const handleDonationSuccess = () => {
    console.log('Donation successful, refreshing campaign list...');
    setRefreshCampaignsKey(prevKey => prevKey + 1);
  };

  return (
    <div className="App">
      <Navigation 
        isAdmin={isAdmin} 
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLoginClick={openLoginModal}
        onAdminLoginClick={openAdminLoginModal}
        onRegisterClick={openRegisterModal}
        onLogoutClick={handleLogout}
        onStartProjectClick={openCreateModal}
      />
      
      {isAdmin ? (
        <AdminPanel />
      ) : (
        <>
          <Banner onStartFundraisingClick={openCreateModal} />
          <div className="content">
            <CampaignList key={refreshCampaignsKey} onDonateClick={openDonateModal} />
          </div>
        </>
      )}

      <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal}>
        <UserLogin onLogin={handleUserLoginSuccess} />
      </Modal>

      <Modal isOpen={isAdminLoginModalOpen} onClose={closeAdminLoginModal}>
        <AdminLogin onLogin={handleAdminLoginSuccess} />
      </Modal>

      <Modal isOpen={isRegisterModalOpen} onClose={closeRegisterModal}>
        <Register onRegisterSuccess={closeRegisterModal} />
      </Modal>

      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal}>
        <CreateCampaignForm onClose={closeCreateModal} />
      </Modal>

      {selectedCampaignForDonation && (
            <Modal isOpen={isDonateModalOpen} onClose={closeDonateModal}>
                <DonateForm 
                    campaignId={selectedCampaignForDonation.id}
                    campaignTitle={selectedCampaignForDonation.title}
                    onClose={closeDonateModal}
                    onDonationSuccess={handleDonationSuccess}
                />
            </Modal>
      )}
    </div>
  );
}

export default App;
