import '../styles/ResourceCard.css'
import waterIcon from '../assets/img/water-icon.png'

function ResourceCard() {
    // Données en dur
    const percentage = 24;
    const remainingLiters = 1435;
    const dailyConsumption = 12;
    
    // Calcul de l'autonomie restante dynamique (arrondi à l'entier le plus proche)
    const estimatedAutonomy = dailyConsumption > 0 
        ? Math.round(remainingLiters / dailyConsumption) 
        : 0;

    return (
        <div className="resource-card">
            {/* Bordure verte décorative sur le côté gauche */}
            <div className={`card-accent-line ${
                percentage <= 10 
                ? "status-critical" 
                : percentage < 25 
                    ? "status-warning" 
                    : "status-normal"
            }`}/>

            {/* En-tête : Icône, Titre et Statut */}
            <div className="card-header">
                <div className="header-title-group">
                    <img className='icon-water' src={waterIcon} alt="water icon" />
                    
                    <div>
                        <p className="resource-card-subtitle">RÉSERVE H₂O</p>
                        <h2 className="resource-card-title">Eau potable</h2>
                    </div>
                </div>
                <div className="status-badge">
                    <span 
                        className={`status-dot ${
                            percentage <= 10 
                            ? "status-critical" 
                            : percentage < 25 
                                ? "status-warning" 
                                : "status-normal"
                        }`}
                    ></span>
                    <p className="status-text">
                        {percentage >= 25 
                            ? "NORMAL" 
                            : percentage > 10 
                                ? "VIGILANCE" 
                                : "CRITIQUE"
                        }
                    </p>
                </div>
            </div>

            {/* Barre de progression principale & pourcentage */}
            <div className="progress-bar-container">
                {/* 1. La barre de remplissage qui varie selon le pourcentage */}
                <div 
                    className={`progress-bar-fill ${
                    percentage <= 10 
                        ? "status-critical" 
                        : percentage < 25 
                        ? "status-warning" 
                        : "status-normal"
                    }`} 
                    style={{ width: `${percentage}%` }}
                />

                {/* 2. Les repères verticaux STATIQUES (toujours visibles) */}
                <span className="threshold-marker" style={{ left: '10%' }} title="Seuil Critique (10%)" />
                <span className="threshold-marker" style={{ left: '25%' }} title="Seuil Vigilance (25%)" />
            </div>

            {/* Grille de statistiques */}
            <div className="stats-grid">
                <div className="stat-item">
                    <span className="stat-label">RESTANT</span>
                    <div className="stat-value-group">
                        <span className="stat-value">{remainingLiters.toLocaleString('fr-FR')}</span>
                        <span className="stat-unit">L</span>
                    </div>
                </div>

                <div className="stat-item">
                    <span className="stat-label">CONSOMMATION</span>
                    <div className="stat-value-group">
                        <span className="stat-value">{dailyConsumption}</span>
                        <span className="stat-unit">L / jour</span>
                    </div>
                </div>

                <div className="stat-item">
                    <span className="stat-label">AUTONOMIE EST.</span>
                    <div className="stat-value-group">
                        <span className="stat-value">{estimatedAutonomy}</span>
                        <span className="stat-unit">jours</span>
                    </div>
                </div>
            </div>

            {/* Légende en bas de carte */}
            <div className="card-legend">
                <div className="legend-item">
                    <span className="legend-dot status-normal"></span>
                    <span>Normal &gt; 25%</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot status-warning"></span>
                    <span>Vigilance &lt; 25%</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot status-critical"></span>
                    <span>Critique &lt; 10%</span>
                </div>
            </div>
        </div>
    );
}


export default ResourceCard;