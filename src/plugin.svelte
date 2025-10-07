<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { CROP_DATABASE } from './cropDatabase';
  import { HeatUnitCalculator } from './heatUnitCalculator';
  import { WindyDataAdapter } from './windyDataAdapter';
  import type { HeatUnitData, TornadoRiskData } from './types';

  // Windy API access
  let map: any;
  let picker: any;
  let store: any;
  let broadcast: any;

  // Component state
  let mode: 'heat-units' | 'tornado' = 'heat-units';
  let selectedCrop = 'corn';
  let baseTemp = CROP_DATABASE[selectedCrop].baseTemp;
  let upperTemp = CROP_DATABASE[selectedCrop].upperTemp;
  let calculationMethod: 'simple' | 'modified' | 'double-sine' = 'modified';
  let timePeriod = 30;
  let isLoading = false;
  let heatUnitData: HeatUnitData | null = null;
  let tornadoData: TornadoRiskData | null = null;
  let selectedLocation: {lat: number, lon: number} | null = null;
  let heatMapLayer: any = null;
  let tornadoLayer: any = null;
  let tornadoForecastHours = 48;

  // Initialize Windy API access
  onMount(async () => {
    // Wait for Windy API to be available
    if (window.W) {
      map = window.W.map;
      picker = window.W.picker;
      store = window.W.store;
      broadcast = window.W.broadcast;

      // Listen for map clicks
      map.on('click', handleMapClick);

      // Listen for picker changes
      broadcast.on('pickerOpened', handlePickerOpened);
    }
  });

  onDestroy(() => {
    if (map) {
      map.off('click', handleMapClick);
    }
    if (broadcast) {
      broadcast.off('pickerOpened', handlePickerOpened);
    }
    if (heatMapLayer) {
      map.removeLayer(heatMapLayer);
    }
    if (tornadoLayer) {
      map.removeLayer(tornadoLayer);
    }
  });

  function handleMapClick(event: any) {
    const { lat, lng } = event.latlng;
    selectedLocation = { lat, lon: lng };
    if (mode === 'heat-units') {
      calculateHeatUnits(lat, lng);
    } else {
      calculateTornadoRisk(lat, lng);
    }
  }

  function handlePickerOpened(event: any) {
    if (event.lat && event.lon) {
      selectedLocation = { lat: event.lat, lon: event.lon };
      if (mode === 'heat-units') {
        calculateHeatUnits(event.lat, event.lon);
      } else {
        calculateTornadoRisk(event.lat, event.lon);
      }
    }
  }

  async function calculateHeatUnits(lat: number, lon: number) {
    isLoading = true;
    try {
      heatUnitData = await WindyDataAdapter.getTemperatureData(lat, lon, timePeriod);
      tornadoData = null;
    } catch (error) {
      console.error('Failed to calculate heat units:', error);
    } finally {
      isLoading = false;
    }
  }

  async function calculateTornadoRisk(lat: number, lon: number) {
    isLoading = true;
    try {
      tornadoData = await WindyDataAdapter.getTornadoRiskData(lat, lon, tornadoForecastHours);
    } catch (error) {
      console.error('Failed to calculate tornado risk:', error);
    } finally {
      isLoading = false;
    }
  }

  function onCropChange() {
    const crop = CROP_DATABASE[selectedCrop];
    baseTemp = crop.baseTemp;
    upperTemp = crop.upperTemp;

    if (selectedLocation && mode === 'heat-units') {
      calculateHeatUnits(selectedLocation.lat, selectedLocation.lon);
    }
  }

  function onTornadoForecastChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    tornadoForecastHours = value;

    if (selectedLocation && mode === 'tornado') {
      calculateTornadoRisk(selectedLocation.lat, selectedLocation.lon);
    }
  }

  function switchMode(nextMode: 'heat-units' | 'tornado') {
    if (mode === nextMode) {
      return;
    }

    mode = nextMode;

    if (mode === 'heat-units') {
      if (tornadoLayer) {
        map.removeLayer(tornadoLayer);
        tornadoLayer = null;
      }
      if (selectedLocation) {
        calculateHeatUnits(selectedLocation.lat, selectedLocation.lon);
      }
    } else {
      if (heatMapLayer) {
        map.removeLayer(heatMapLayer);
        heatMapLayer = null;
      }
      if (selectedLocation) {
        calculateTornadoRisk(selectedLocation.lat, selectedLocation.lon);
      }
    }
  }

  function toggleOverlay() {
    if (!map) {
      return;
    }

    if (mode === 'heat-units') {
      if (heatMapLayer) {
        map.removeLayer(heatMapLayer);
        heatMapLayer = null;
      } else {
        createHeatMapOverlay();
      }
    } else {
      if (tornadoLayer) {
        map.removeLayer(tornadoLayer);
        tornadoLayer = null;
      } else {
        createTornadoOverlay();
      }
    }
  }

  async function createHeatMapOverlay() {
    const bounds = map.getBounds();
    const settings = {
      crop: selectedCrop,
      baseTemp,
      upperTemp,
      timePeriod
    };

    try {
      const overlayData = await WindyDataAdapter.generateHeatMapData(bounds, settings);
      const L = (window as any).L;

      if (!L) {
        console.warn('Leaflet API not available to render heat map overlay.');
        return;
      }

      const layerGroup = L.layerGroup();

      overlayData.data.forEach((point: any) => {
        const color = getHeatMapColor(point.intensity);
        const marker = L.circleMarker([point.lat, point.lon], {
          radius: 6,
          color,
          fillColor: color,
          fillOpacity: 0.55,
          weight: 0,
        });

        marker.bindPopup(`GDD: ${point.gdd.toFixed(0)}\nIntensity: ${(point.intensity * 100).toFixed(0)}%`);
        layerGroup.addLayer(marker);
      });

      layerGroup.addTo(map);
      heatMapLayer = layerGroup;
    } catch (error) {
      console.error('Failed to create heat map:', error);
    }
  }

  async function createTornadoOverlay() {
    const bounds = map.getBounds();

    try {
      const overlayData = await WindyDataAdapter.generateTornadoRiskOverlay(bounds, tornadoForecastHours);
      const L = (window as any).L;

      if (!L) {
        console.warn('Leaflet API not available to render tornado overlay.');
        return;
      }

      const layerGroup = L.layerGroup();

      overlayData.points.forEach((point) => {
        const color = getRiskColor(point.riskIndex);
        const marker = L.circleMarker([point.lat, point.lon], {
          radius: Math.max(4, (point.riskIndex / 10) * 9),
          color,
          fillColor: color,
          fillOpacity: 0.6,
          weight: 1,
        });

        marker.bindPopup(`Risk index: ${point.riskIndex.toFixed(1)} / 10\nProbability: ${(point.probability * 100).toFixed(0)}%`);
        layerGroup.addLayer(marker);
      });

      layerGroup.addTo(map);
      tornadoLayer = layerGroup;
    } catch (error) {
      console.error('Failed to create tornado overlay:', error);
    }
  }

  function getHeatMapColor(intensity: number) {
    const clamped = Math.max(0, Math.min(1, intensity));
    const hue = 200 - clamped * 160;
    return `hsl(${hue}, 85%, ${40 + clamped * 20}%)`;
  }

  function getRiskColor(riskIndex: number) {
    const ratio = Math.max(0, Math.min(1, riskIndex / 10));
    const hue = 120 - ratio * 120;
    return `hsl(${hue}, 85%, ${40 + ratio * 10}%)`;
  }

  $: cropStage = heatUnitData ?
    HeatUnitCalculator.getCropStage(
      heatUnitData.gdd,
      CROP_DATABASE[selectedCrop].gddRequired
    ) : '';

  $: daysToMaturity = heatUnitData ?
    HeatUnitCalculator.estimateDaysToMaturity(
      heatUnitData.gdd,
      CROP_DATABASE[selectedCrop].gddRequired,
      heatUnitData.dailyGdd.slice(-7).reduce((a, b) => a + b, 0) / 7
    ) : 0;

  $: completionPercentage = heatUnitData ?
    Math.min(100, (heatUnitData.gdd / CROP_DATABASE[selectedCrop].gddRequired) * 100) : 0;
</script>

<section class="plugin-container">
  <header class="plugin-header">
    <h2>🌡️ Agricultural Heat Units</h2>
    <p>Growing Degree Days & Severe Weather Toolkit</p>
  </header>

  <div class="mode-toggle">
    <button
      class:active={mode === 'heat-units'}
      on:click={() => switchMode('heat-units')}
      type="button"
    >
      🌱 Heat Units
    </button>
    <button
      class:active={mode === 'tornado'}
      on:click={() => switchMode('tornado')}
      type="button"
    >
      🌪️ Tornado Outlook
    </button>
  </div>

  <div class="controls">
    {#if mode === 'heat-units'}
      <div class="control-group">
        <label for="crop-select">Crop Type:</label>
        <select id="crop-select" bind:value={selectedCrop} on:change={onCropChange}>
          {#each Object.entries(CROP_DATABASE) as [key, crop]}
            <option value={key}>{crop.icon} {crop.name}</option>
          {/each}
        </select>
      </div>

      <div class="control-group">
        <label for="base-temp">Base Temperature (°C):</label>
        <input id="base-temp" type="number" bind:value={baseTemp} min="0" max="25" step="0.5" />
      </div>

      <div class="control-group">
        <label for="upper-temp">Upper Threshold (°C):</label>
        <input id="upper-temp" type="number" bind:value={upperTemp} min="20" max="45" step="0.5" />
      </div>

      <div class="control-group">
        <label for="method">Calculation Method:</label>
        <select id="method" bind:value={calculationMethod}>
          <option value="simple">Simple Average</option>
          <option value="modified">Modified (No Negatives)</option>
          <option value="double-sine">Double Sine</option>
        </select>
      </div>

      <div class="control-group">
        <label for="period">Time Period (days):</label>
        <select id="period" bind:value={timePeriod}>
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="60">Last 60 days</option>
          <option value="90">Growing Season</option>
        </select>
      </div>

      <button class="overlay-toggle" on:click={toggleOverlay} type="button">
        {heatMapLayer ? 'Hide' : 'Show'} Heat Map
      </button>
    {:else}
      <div class="control-group">
        <label for="forecast-window">Forecast Window:</label>
        <select
          id="forecast-window"
          bind:value={tornadoForecastHours}
          on:change={onTornadoForecastChange}
        >
          <option value={24}>Next 24 hours</option>
          <option value={36}>Next 36 hours</option>
          <option value={48}>Next 48 hours</option>
          <option value={72}>Next 72 hours</option>
          <option value={96}>Next 96 hours</option>
        </select>
      </div>

      <div class="control-group">
        <span class="control-label">Model Ingredients:</span>
        <p class="control-hint">Uses CAPE, wind shear, and helicity from forecast data.</p>
      </div>

      <button class="overlay-toggle" on:click={toggleOverlay} type="button">
        {tornadoLayer ? 'Hide' : 'Show'} Tornado Risk Overlay
      </button>
    {/if}
  </div>

  {#if selectedLocation}
    <div class="location-info">
      <p><strong>Selected Location:</strong> {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}</p>
    </div>
  {/if}

  {#if isLoading}
    <div class="loading">
      <p>🔄 {mode === 'heat-units' ? 'Calculating heat units…' : 'Analyzing tornado forecast…'}</p>
    </div>
  {/if}

  {#if mode === 'heat-units' && heatUnitData}
    <div class="results">
      <div class="result-card main-stats">
        <h3>Heat Unit Summary</h3>
        <div class="stat-grid">
          <div class="stat">
            <span class="label">Accumulated GDD:</span>
            <span class="value">{heatUnitData.gdd.toFixed(1)}</span>
          </div>
          <div class="stat">
            <span class="label">Required for {CROP_DATABASE[selectedCrop].name}:</span>
            <span class="value">{CROP_DATABASE[selectedCrop].gddRequired}</span>
          </div>
          <div class="stat">
            <span class="label">Completion:</span>
            <span class="value">{completionPercentage.toFixed(1)}%</span>
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" style="width: {completionPercentage}%"></div>
        </div>
      </div>

      <div class="result-card">
        <h3>Crop Development</h3>
        <p><strong>Current Stage:</strong> {cropStage}</p>
        {#if daysToMaturity > 0 && daysToMaturity !== Infinity}
          <p><strong>Est. Days to Maturity:</strong> {daysToMaturity} days</p>
        {:else if completionPercentage >= 100}
          <p><strong>Status:</strong> ✅ Ready for harvest</p>
        {/if}
      </div>

      <div class="result-card">
        <h3>Temperature Summary ({timePeriod} days)</h3>
        <div class="temp-stats">
          <div>Min: {heatUnitData.temperature.min.toFixed(1)}°C</div>
          <div>Max: {heatUnitData.temperature.max.toFixed(1)}°C</div>
          <div>Avg: {heatUnitData.temperature.avg.toFixed(1)}°C</div>
        </div>
      </div>

      <div class="result-card">
        <h3>Recent GDD Trend</h3>
        <div class="trend-chart">
          {#each heatUnitData.dailyGdd.slice(-14) as gdd, i}
            <div
              class="trend-bar"
              style="height: {Math.max(2, (gdd / Math.max(...heatUnitData.dailyGdd)) * 60)}px"
              title="Day {i + 1}: {gdd.toFixed(1)} GDD"
            ></div>
          {/each}
        </div>
        <p class="chart-label">Last 14 days daily GDD accumulation</p>
      </div>
    </div>
  {/if}

  {#if mode === 'tornado' && tornadoData}
    <div class="results">
      <div class="result-card main-stats">
        <h3>Tornado Risk Outlook</h3>
        <div class="stat-grid">
          <div class="stat">
            <span class="label">Risk Index (0-10):</span>
            <span class="value risk-value" style:color={getRiskColor(tornadoData.riskIndex)}>
              {tornadoData.riskIndex.toFixed(1)}
            </span>
          </div>
          <div class="stat">
            <span class="label">Probability:</span>
            <span class="value">{Math.round(tornadoData.probability * 100)}%</span>
          </div>
          <div class="stat">
            <span class="label">Forecast Window:</span>
            <span class="value">Next {tornadoData.forecastHours}h</span>
          </div>
        </div>
        <p class="risk-summary">{tornadoData.summary}</p>
      </div>

      <div class="result-card">
        <h3>Key Ingredients</h3>
        <ul class="tornado-ingredients">
          <li><strong>CAPE:</strong> {tornadoData.parameters.cape} J/kg</li>
          <li><strong>0-6 km Shear:</strong> {tornadoData.parameters.shear} m/s</li>
          <li><strong>Storm-Relative Helicity:</strong> {tornadoData.parameters.helicity} m²/s²</li>
        </ul>
        <p class="ingredients-note">Higher values of these ingredients support rotating updrafts that can produce tornadoes.</p>
      </div>

      <div class="result-card">
        <h3>Risk Trend</h3>
        <div class="trend-chart tornado">
          {#each tornadoData.timeline as point}
            <div
              class="trend-bar"
              style:height={`${Math.max(4, (point.riskIndex / 10) * 70)}px`}
              style:background={getRiskColor(point.riskIndex)}
              title={`T+${point.hourOffset}h · Risk ${point.riskIndex.toFixed(1)} · ${Math.round(point.probability * 100)}% chance`}
            ></div>
          {/each}
        </div>
        <p class="chart-label">Risk index every 3 hours ({tornadoData.timeline.length} points)</p>
      </div>
    </div>
  {/if}

  <div class="instructions">
    <h3>How to Use</h3>
    <ul>
      <li>🎯 Click anywhere on the map to analyze the selected location</li>
      <li>🌾 Use Heat Units mode to pick a crop and adjust temperature thresholds</li>
      <li>🌪️ Switch to Tornado Outlook mode to evaluate forecast-based risk ingredients</li>
      <li>🗺️ Toggle the overlay to visualize either GDD or tornado risk across the map</li>
      <li>📈 Review trend cards to monitor crop progress or tornado risk timing</li>
    </ul>
  </div>
</section>

<style>
  .plugin-container {
    padding: 16px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-height: 90vh;
    overflow-y: auto;
  }

  .plugin-header {
    text-align: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 10px;
  }

  .plugin-header h2 {
    margin: 0 0 5px 0;
    color: #2c3e50;
    font-size: 1.4rem;
  }

  .plugin-header p {
    margin: 0;
    color: #7f8c8d;
    font-size: 0.9rem;
  }

  .mode-toggle {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin: 16px 0;
  }

  .mode-toggle button {
    border: none;
    border-radius: 8px;
    padding: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    background: #ecf0f1;
    color: #2c3e50;
    transition: all 0.25s ease;
  }

  .mode-toggle button:hover {
    background: #dfe6e9;
  }

  .mode-toggle button.active {
    background: linear-gradient(135deg, #6c5ce7, #0984e3);
    color: white;
    box-shadow: 0 6px 16px rgba(108, 92, 231, 0.25);
  }

  .controls {
    margin-bottom: 20px;
  }

  .control-hint {
    margin: 0;
    font-size: 0.8rem;
    color: #5f6d7a;
    background: #f2f4f6;
    padding: 8px 10px;
    border-radius: 6px;
  }

  .control-group {
    margin-bottom: 12px;
  }

  .control-group label,
  .control-label {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
    color: #34495e;
    font-size: 0.85rem;
  }

  .control-group select,
  .control-group input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
    font-size: 0.85rem;
    background: white;
  }

  .control-group select:focus,
  .control-group input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  .overlay-toggle {
    width: 100%;
    padding: 10px;
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
    transition: all 0.3s ease;
  }

  .overlay-toggle:hover {
    background: linear-gradient(135deg, #2980b9, #1f5f99);
    transform: translateY(-1px);
  }

  .location-info {
    background: #ecf0f1;
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 0.85rem;
  }

  .loading {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
  }

  .results {
    margin-bottom: 20px;
  }

  .result-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .result-card h3 {
    margin: 0 0 12px 0;
    color: #2c3e50;
    font-size: 1rem;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 6px;
  }

  .main-stats {
    background: linear-gradient(135deg, #74b9ff, #0984e3);
    color: white;
    border: none;
  }

  .main-stats h3 {
    color: white;
    border-bottom-color: rgba(255, 255, 255, 0.3);
  }

  .stat-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 15px;
  }

  .stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat .label {
    font-size: 0.85rem;
    opacity: 0.9;
  }

  .stat .value {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .risk-value {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  .risk-summary {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.4;
    background: rgba(255, 255, 255, 0.2);
    padding: 10px;
    border-radius: 6px;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #00b894;
    border-radius: 4px;
    transition: width 0.6s ease;
  }

  .temp-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    text-align: center;
  }

  .temp-stats div {
    background: white;
    padding: 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .tornado-ingredients {
    list-style: none;
    padding: 0;
    margin: 0 0 10px 0;
    display: grid;
    gap: 6px;
  }

  .tornado-ingredients li {
    background: white;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 0.85rem;
    display: flex;
    justify-content: space-between;
  }

  .ingredients-note {
    margin: 0;
    font-size: 0.8rem;
    color: #57606f;
  }

  .trend-chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 60px;
    padding: 6px 4px 0 4px;
  }

  .trend-chart.tornado {
    background: #f5f6fa;
    border-radius: 6px;
    padding-bottom: 6px;
  }

  .trend-bar {
    flex: 1;
    background: linear-gradient(to top, #74b9ff, #0984e3);
    border-radius: 2px 2px 0 0;
    min-height: 2px;
    transition: all 0.3s ease;
  }

  .trend-bar:hover {
    background: linear-gradient(to top, #00b894, #00a085);
  }

  .chart-label {
    font-size: 0.75rem;
    text-align: center;
    color: #7f8c8d;
    margin: 5px 0 0 0;
  }

  .instructions {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 16px;
  }

  .instructions h3 {
    margin: 0 0 10px 0;
    color: #856404;
    font-size: 1rem;
  }

  .instructions ul {
    margin: 0;
    padding-left: 20px;
  }

  .instructions li {
    margin-bottom: 6px;
    font-size: 0.85rem;
    color: #856404;
    line-height: 1.4;
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .plugin-container {
      padding: 12px;
    }

    .temp-stats {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .trend-chart {
      height: 40px;
    }
  }
</style>
