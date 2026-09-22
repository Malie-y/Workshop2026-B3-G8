import { NavLink } from 'react-router-dom';
import logoEsa from '../assets/img/logo-esa.svg'
import '../styles/LandingPage.css'

function LandingPage() {
    return (
        <section>
            <div className='brand'>
                <img src={logoEsa} alt="Logo ESA" />
                <p className='subtitle'>EUROPEAN SPACE AGENCY</p>
                <p className='title'>DEEP HORIZON <span>IX</span></p>
            </div>
            <div className='button-group'>
                <button>Serre Botanique</button>
                <NavLink to="/crew-and-survival-system">
                    <button>Système Équipage & Survie</button>
                </NavLink>
            </div>
        </section>
    )
}

export default LandingPage;