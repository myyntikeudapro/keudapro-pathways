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

// If SSG has already rendered content into #root, hydrate it.
// Otherwise (dev, or a route without a prerendered file) create a fresh root.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
