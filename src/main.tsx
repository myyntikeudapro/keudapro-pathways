import { hydrateRoot, createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;

const tree = (
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

// The prerendered HTML contains only a crawler-facing SEO block (not a full
// React tree), so we drop it and mount a fresh root — hydrating it would
// produce mismatches.
container.querySelectorAll("[data-ssg-seo]").forEach((el) => el.remove());
createRoot(container).render(tree);

