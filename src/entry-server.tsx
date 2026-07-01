import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";

export interface RenderResult {
  html: string;
  helmet: any;
}

export function render(url: string): RenderResult {
  const helmetContext: { helmet?: any } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  );

  return {
    html,
    helmet: helmetContext.helmet,
  };
}
