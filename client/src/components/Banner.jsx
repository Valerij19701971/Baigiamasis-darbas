import React from 'react';
import './Banner.css';

function Banner({ onStartFundraisingClick }) {
    return (
        <div className="banner">
            <div className="banner-content">
                <h1 className="banner-title">Paremk gyvūnu prieglaudą</h1>
                <p className="banner-subtitle">Nuo veiklos pradžios 2019 m. išgelbėjome daugiau nei 100 gyvūnų. Kasdien rūpinamės daugiau nei 50 globotinių. Pastatėme modernų prieglaudos pastatą, voljerus. Ieškome  globotiniems naujus šeimininkus. Dienas leisti prieglaudoje – ne pyragai. Paremkite gyvuną, o mes kiek galėdami padovanosime jam jaukesnes dienas. </p>
                <button onClick={onStartFundraisingClick} className="banner-button">Pradėti rinkti lėšas</button>
            </div>
        </div>
    );
}

export default Banner; 