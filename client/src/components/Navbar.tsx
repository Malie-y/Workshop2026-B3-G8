import '../styles/Navbar.css'
import logoEsa from '../assets/img/logo-esa.svg'
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Navbar() {
    const [time, setTime] = useState<Date>(new Date());

    useEffect(() => {
        // Met à jour l'heure toutes les 1000ms (1 seconde)
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        // Nettoie l'intervalle lorsque le composant est démonté
        return () => clearInterval(timer);
    }, []);

    // Formate l'heure au format local (ex: 14:30:15)
    const formattedTime = time.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const [currentDay, setCurrentDay] = useState<number>(1);
    const startDate = "2026-09-20"; // Format YYYY-MM-DD (ex: "2026-09-20")
    const totalDays = 90; // Nombre total de jours (90 par défaut)

    useEffect(() => {
        const calculateDay = () => {
            const start = new Date(startDate);
            const now = new Date();

            // On définit l'heure du changement de jour à 07:00:00
            const CHANGE_HOUR = 7;

            // Si l'heure actuelle est avant 7h, on retire 1 jour au calcul
            // car la nouvelle journée n'a pas encore commencé
            if (now.getHours() < CHANGE_HOUR) {
                now.setDate(now.getDate() - 1);
            }

            // Réinitialiser les heures pour comparer uniquement les dates entières
            start.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);

            // Calcul de la différence en jours
            const diffTime = now.getTime() - start.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

            // S'assurer de ne pas afficher un jour inférieur à 1
            setCurrentDay(Math.max(1, diffDays));
        };

        calculateDay();

        // Vérifie et recalcule toutes les minutes
        const interval = setInterval(calculateDay, 60000);

        return () => clearInterval(interval);
    }, [startDate]);

    return (
        <section className="navbar">
            <div className='brand'>
                <img className='brand-logo' src={logoEsa} alt="Logo ESA" />
                <p className='brand-subtitle'>EUROPEAN SPACE AGENCY <br />
                    <span className='brand-title'>DEEP HORIZON <span className='blue-text'>IX</span></span>
                </p>
            </div>

            <nav className='button-group-nav'>
                <NavLink 
                    to="/botanical-garden" 
                    className={({ isActive }) => isActive ? "button-nav button-active" : "button-nav"}
                >
                    Serre Botanique
                </NavLink>
                <NavLink 
                    to="/crew-and-survival-system"
                    className={({ isActive }) => isActive ? "button-nav button-active" : "button-nav"}
                >
                    Système Équipage & Survie
                </NavLink>
            </nav>

            <div className='time'>
                <p className='date'>J{currentDay} / {totalDays}</p>
                <p className='hour'>{formattedTime}</p>
            </div>
        </section>
    )
}

export default Navbar;