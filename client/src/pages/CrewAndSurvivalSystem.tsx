import Navbar from "../components/Navbar";
import ResourceCard from "../components/ResourceCard";
import '../styles/CrewAndSurvivalSystem.css'

function CrewAndSurvivalSystem() {
    return (
        <>
            <Navbar />
            <section className="resources">
                <p>Ressources critiques</p>
                <ResourceCard />
            </section>
        </>
    )
}

export default CrewAndSurvivalSystem;