import App from "./App";
import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import CrewAndSurvivalSystem from "./pages/CrewAndSurvivalSystem";
import BotanicalGarden from "./pages/BotanicalGarden";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/crew-and-survival-system",
        element: <CrewAndSurvivalSystem />
      },
      {
        path: "/botanical-garden",
        element: <BotanicalGarden />
      }
    ]
  }
]);

export default router;