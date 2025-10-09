# windy-plugin-heat-units

## Overview

This plugin calculates and visualizes Growing Degree Days (GDD) for agricultural planning and crop management. It integrates seamlessly with Windy.com's weather platform to provide farmers and agricultural professionals with essential heat unit data.

Once published, you can load the plugin directly from `https://windy-plugins.com/plugins/windy-plugin-heat-units/plugin.json`.
If that URL returns a `NoSuchKey` error, run `npm run check:plugin-url` to verify whether the file is reachable. The script performs
a quick HEAD request and prints guidance if the upload is still propagating or the path is incorrect.

## Features

- **Real-time GDD calculation** for any location on the map
- **Multiple crop presets** with optimized temperature thresholds
- **Three calculation methods**: Simple, Modified, and Double-Sine
- **Interactive heat map overlay** showing regional GDD distribution
- **Crop development stage tracking** and harvest timing estimates
- **Historical analysis** with configurable time periods
- **Forecast-based tornado outlook** with map overlay and risk timeline

## Installation

### Prerequisites

Install [Node.js](https://nodejs.org/) **v18** or newer so that the build scripts
work consistently with the GitHub Actions workflow.

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/crop-crusaders/windy-plugin-heat-units.git
   cd windy-plugin-heat-units
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the build watcher:
   ```bash
   npm start
   ```
4. Open Windy Plugins and navigate to `https://windy-plugins.com/dev` to test the plugin.
   If the browser refuses to load the page because of the self-signed
   certificate, run:

   ```bash
   npm run open:dev
   ```

   The command launches Chrome/Chromium/Edge with certificate warnings disabled
   for the session and points it directly to the Windy development portal. If
   you prefer to use another browser, follow the manual certificate acceptance
   steps in the troubleshooting section.
   The official getting-started guide mentions a local server at
   `http://localhost:9999/plugin.js`, but this project only compiles the
   plugin; it does not start a web server.
   The `npm start` command watches the source files and continuously writes the
   bundle to `dist/plugin.js`. Windy's development site reads that file directly
   after you accept its self-signed certificate (see troubleshooting below), so
   there's no need to run `npm run dev` or any additional HTTP server.

### Troubleshooting development builds

- **"Error loading plugin... dev server is not running"**: Windy loads
  development builds over HTTPS with a self-signed certificate. Open the
  requested URL (for example,
  `https://windy-plugins.com/11047871/windy-plugin-heat-units/1.0.12/plugin.min.js`)
  directly in your browser and accept the certificate warning. Reload the
  Windy Plugin dev page afterwards and the bundle will be served correctly.
  Alternatively, run `npm run open:dev` to launch a Chromium-based browser with
  certificate warnings suppressed for the session.

#### Accepting Windy's self-signed certificate manually

Most browsers make it possible to trust the Windy development portal's
self-signed certificate for a single session. The exact wording differs per
browser, but the flow is generally:

1. Open `https://windy-plugins.com/dev` (or the plugin URL that Windy is trying
   to fetch) and wait for the warning page to appear.
2. Review the certificate details to confirm the page is actually hosted by
   `windy-plugins.com`.
3. Follow the browser-specific prompts:
   - **Chrome / Edge / Chromium**: Click **Advanced** → **Proceed to
     windy-plugins.com (unsafe)**. The exception lasts until you close the
     browser.
   - **Firefox**: Click **Advanced** → **Accept the Risk and Continue**. Firefox
     stores the exception and will load the dev portal normally afterwards.
   - **Safari (macOS)**: Click **Show Details** → **visit this website** →
     **Visit Website**. macOS may prompt for your password to add the temporary
     trust entry.
4. Reload `https://windy-plugins.com/dev` and the plugin bundle should load
   immediately, as long as `npm start` is still running.

If you'd rather skip these prompts, run `npm run open:dev` to launch a
Chromium-based browser instance with the necessary flags to ignore certificate
warnings for the session.

> **Note for iOS testers:** The Windy development portal currently cannot be
> trusted on iOS Safari. After tapping **Show Details** → **Visit This
> Website**, Safari reloads the request without the certificate exception and
> Windy's CDN returns a `NoSuchKey` error. To test on mobile, accept the
> certificate on a desktop browser and use remote debugging or browser sync to
> inspect the plugin, or publish a staging build and load it from the public
> plugin catalog instead.
- **"NoSuchKey" while loading the production URL**: Confirm that the GitHub
  Actions release workflow completed successfully. Then run `npm run
  check:plugin-url` locally to ensure the published file is live. If the
  command reports `NoSuchKey`, wait a few minutes and retry—the CDN may still
  be propagating the asset. Persistent `NoSuchKey` responses indicate the
  release did not finish and the archive must be uploaded again.

### Frequently asked questions

#### Do I need to run my own server to try the plugin locally?

No. When you run `npm start` the build pipeline writes the latest bundle into
the `dist/` folder. The Windy development portal (`https://windy-plugins.com/dev`)
loads that bundle over HTTPS once you've trusted Windy's self-signed
certificate. If the page still reports that the dev server is unavailable, it
usually means the certificate hasn't been accepted yet—follow the steps in the
troubleshooting section and reload the page.

### Production Deployment

1. Get API key from https://api.windy.com/keys
2. Add `WINDY_API_KEY` to your GitHub repository secrets
3. (Optional) Run `npm run check:api-key` locally to confirm the environment
   variable is available before triggering a release.
4. Push to the `main` branch. The GitHub Actions workflow automatically builds
   the plugin, packages it as `windy-plugin-heat-units.tar`, and uploads it over
   a secure HTTPS connection.
5. To publish manually from your local machine, run:
   ```bash
   export WINDY_API_KEY=<your_key>
   npm run release
   ```
   The `npm run release` script invokes `curl` with the `x-windy-api-key` header
   and uploads `windy-plugin-heat-units.tar`. If the API key is missing or
   invalid, the upload request will fail with `403 Forbidden`.

6. After the upload completes, verify that the CDN is serving the new build:
   ```bash
   npm run check:plugin-url
   ```
   The command checks the published `plugin.json` and reports whether the file
   is accessible. If the response still mentions `NoSuchKey`, wait a few
   minutes for propagation or rerun the release if the asset never appears.
   
   **Note:** Some networks block POST requests to `windy-plugins.com`. If the
   upload fails with `Method forbidden`, run the release from a network that
   allows outbound HTTPS POST to that domain.

### Keeping the plugin live 24/7

Windy serves public plugins directly from the tarball you upload through the
release workflow. Once a version is published, it stays online until you
replace or remove it, so the main tasks for keeping the plugin "always on" are
operational:

1. **Maintain an evergreen `plugin.json`.** Ensure the `dist/plugin.json`
   points to the latest tarball name that the release workflow uploads. If the
   file references an old archive, Windy's CDN will continue serving that
   version even after you publish a new build.
2. **Keep the release automation healthy.** The GitHub Actions workflow only
   runs when you push to `main`. Check the "Releases" workflow in GitHub after
   each merge to confirm it finished successfully and uploaded the tarball.
   Rerun the workflow (or trigger `npm run release` locally) if it fails.
3. **Monitor CDN availability.** Schedule a simple uptime check—such as a
   GitHub Actions cron job or an external monitor—to request
   `https://windy-plugins.com/plugins/windy-plugin-heat-units/plugin.json`.
   Alert on non-200 responses so you can re-upload quickly if the file ever
   disappears.
4. **Re-release when secrets rotate.** If your `WINDY_API_KEY` expires or is
   revoked, all automated uploads will fail until you update the GitHub secret.
   Replace the key promptly and rerun the release workflow to keep the plugin
   available.
5. **Enable automated uptime enforcement.** This repository now ships with an
   `Ensure plugin uptime` GitHub Actions workflow (`.github/workflows/ensure-plugin-uptime.yml`).
   Add the `WINDY_API_KEY` secret to your repository settings and the job will
   run hourly to verify that `plugin.json` is reachable and still advertises the
   current version from `package.json`. If the check fails, the workflow invokes
   `npm run release` automatically and then rechecks availability so the plugin
   comes back online without manual intervention.

As long as the CDN endpoint continues returning `200 OK`, users can load the
plugin any time without needing your development environment to be online.

## Usage

1. **Select Location**: Click anywhere on the Windy map
2. **Choose Crop**: Select from preset crops or use custom settings
3. **Configure Parameters**: Adjust base temperature, upper threshold, and calculation method
4. **Tornado Outlook (Optional)**: Switch to the tornado mode to review forecast risk ingredients and probability
5. **View Results**: Analyze accumulated GDD, crop development stage, tornado risk timeline, and map overlays

## Supported Crops

- 🌽 Corn (Base: 10°C, Target: 1200 GDD)
- 🌾 Wheat (Base: 4°C, Target: 1400 GDD)
- 🫘 Soybean (Base: 10°C, Target: 1300 GDD)
- 🌾 Rice (Base: 12°C, Target: 1800 GDD)
- 🌿 Cotton (Base: 15.5°C, Target: 1600 GDD)
- 🍅 Tomato (Base: 10°C, Target: 1100 GDD)
- 🥔 Potato (Base: 7°C, Target: 1000 GDD)
- 🌻 Canola (Base: 5°C, Target: 1400 GDD)

## Technical Details

- Built with TypeScript and Svelte
- Uses Leaflet for map integration
- Integrates with Windy's weather data APIs
- Custom heat map overlay implementation
- Responsive design for desktop and mobile

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: Report bugs and request features
- Windy Community: https://community.windy.com/category/21/windy-plugins
- Documentation: https://docs.windy-plugins.com
