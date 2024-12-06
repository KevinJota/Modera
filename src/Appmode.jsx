// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import './css/Appmod.css';
import Usuarios from './components/usuarios';
import Eventos from './components/eventos';
import Historico from './components/historico';
import Denuncias from './components/denuncias';
import NavBar from './components/navbar';
import Login from './components/login';
import Logo from './assets/img/logo.svg';

const Appmod = () => {
    const [activeTab, setActiveTab] = useState('usuarios');
    const [moderadorId, setModeradorId] = useState(null);

    if (!moderadorId) {
        return <Login onLogin={setModeradorId} />;
    }

    let content;
    switch (activeTab) {
        case 'usuarios':
            content = <Usuarios moderadorId={moderadorId} />;
            break;
        case 'historico':
            content = <Historico />;
            break;
        case 'denuncias':
            content = <Denuncias />;
            break;
        case 'eventos':
            content = <Eventos />;
            break;
        default:
            content = <Usuarios moderadorId={moderadorId} />;
            break;
    }

    return (
        <div>
            <div className="header-mod">
                <img src={Logo} alt="logo" className="logo-mod" />
                <h1>Central</h1>
            </div>
            <div className="navbar">
                <NavBar setActiveTab={setActiveTab} />
                <div>{content}</div>
            </div>
        </div>
    );
};

export default Appmod;
