import React, { useState } from 'react';
import './Navigation.css';

function Navigation({ isAdmin, isLoggedIn, currentUser, onLoginClick, onAdminLoginClick, onRegisterClick, onLogoutClick, onStartProjectClick }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    
    const handleMobileLinkClick = (action) => {
        action();
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className={`navbar ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
            <a href="/" className="logo">Aukojimo platforma</a>
            
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                &#9776;
            </button>
            
            <div className={`nav-links-container ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="nav-right">
                    <a href="/about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Apie</a>
                    {isAdmin || isLoggedIn ? (
                        <>
                            {isLoggedIn && currentUser && <span className="nav-username">Sveiki, {currentUser.username}!</span>}
                            <button onClick={() => handleMobileLinkClick(onLogoutClick)} className="nav-link logout-button">Atsijungti</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleMobileLinkClick(onLoginClick)} className="nav-link login-button">Prisijungti</button>
                            <button onClick={() => handleMobileLinkClick(onRegisterClick)} className="nav-link register-button">Registruotis</button>
                            <button onClick={() => handleMobileLinkClick(onAdminLoginClick)} className="nav-link admin-login-button">Admin Prisijungimas</button>
                        </>
                    )}
                    <button onClick={() => handleMobileLinkClick(onStartProjectClick)} className="nav-button">Pradėti Projektą</button>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
