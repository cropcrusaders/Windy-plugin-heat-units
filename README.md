# windy-plugin-heat-units

## Overview

This plugin calculates and visualizes Growing Degree Days (GDD) for agricultural planning and crop management. It integrates seamlessly with Windy.com's weather platform to provide farmers and agricultural professionals with essential heat unit data.

Once published, you can load the plugin directly from https://windy-plugins.com/plugins/windy-plugin-heat-units/plugin.json. If the URL returns a `NoSuchKey` error, the plugin has not been uploaded yet.

## Features

- **Real-time GDD calculation** for any location on the map
- **Multiple crop presets** with optimized temperature thresholds
- **Three calculation methods**: Simple, Modified, and Double-Sine
- **Interactive heat map overlay** showing regional GDD distribution
- **Crop development stage tracking** and harvest timing estimates
- **Historical analysis** with configurable time periods

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
   The official getting-started guide mentions a local server at
   `http://localhost:9999/plugin.js`, but this project only compiles the
   plugin; it does not start a web server.

### Production Deployment

1. Get API key from https://api.windy.com/keys
2. Add `WINDY_API_KEY` to your GitHub repository secrets
3. Push to the `main` branch. The GitHub Actions workflow automatically builds
   the plugin, packages it as `windy-plugin-heat-units.tar`, and uploads it over
   a secure HTTPS connection.
4. To publish manually from your local machine, run:
   ```bash
   export WINDY_API_KEY=<your_key>
   npm run release
   ```
   The `npm run release` script invokes `curl` with the `x-windy-api-key` header
   and uploads `windy-plugin-heat-units.tar`. If the API key is missing or
   invalid, the upload request will fail with `403 Forbidden`.
   
   **Note:** Some networks block POST requests to `windy-plugins.com`. If the
   upload fails with `Method forbidden`, run the release from a network that
   allows outbound HTTPS POST to that domain.

## Usage

1. **Select Location**: Click anywhere on the Windy map
2. **Choose Crop**: Select from preset crops or use custom settings
3. **Configure Parameters**: Adjust base temperature, upper threshold, and calculation method
4. **View Results**: Analyze accumulated GDD, crop development stage, and harvest timing
5. **Heat Map**: Toggle regional heat map overlay for area-wide analysis

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
