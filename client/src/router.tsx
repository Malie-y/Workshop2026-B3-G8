import App from "./App";
import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      }
    ]
  }
]);

export default router;