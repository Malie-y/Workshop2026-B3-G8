import App from "./App";
import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import CrewAndSurvivalSystem from "./pages/CrewAndSurvivalSystem";

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
      }
    ]
  }
]);

export default router;