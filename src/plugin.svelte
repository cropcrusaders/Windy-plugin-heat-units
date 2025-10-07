<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { CROP_DATABASE } from './cropDatabase';
  import { HeatUnitCalculator } from './heatUnitCalculator';
  import { WindyDataAdapter } from './windyDataAdapter';
  import type { HeatUnitData, CalculationSettings } from './types';

  // Windy API access
  let map: any;
  let picker: any;
  let store: any;
  let broadcast: any;

  // Component state
  let selectedCrop = 'corn';
  let baseTemp = CROP_DATABASE[selectedCrop].baseTemp;
  let upperTemp = CROP_DATABASE[selectedCrop].upperTemp;
  let calculationMethod: 'simple' | 'modified' | 'double-sine' = 'modified';
  let timePeriod = 30;
  let isLoading = false;
  let heatUnitData: HeatUnitData | null = null;
  let selectedLocation: {lat: number, lon: number} | null = null;
  let heatMapLayer: any = null;

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
  });

  function handleMapClick(event: any) {
    const { lat, lng } = event.latlng;
    selectedLocation = { lat, lon: lng };
    calculateHeatUnits(lat, lng);
  }

  function handlePickerOpened(event: any) {
    if (event.lat && event.lon) {
      selectedLocation = { lat: event.lat, lon: event.lon };
      calculateHeatUnits(event.lat, event.lon);
    }
  }

  async function calculateHeatUnits(lat: number, lon: number) {
    isLoading = true;
    try {
      heatUnitData = await WindyDataAdapter.getTemperatureData(lat, lon, timePeriod);
    } catch (error) {
      console.error('Failed to calculate heat units:', error);
    } finally {
      isLoading = false;
    }
  }

  function onCropChange() {
    const crop = CROP_DATABASE[selectedCrop];
    baseTemp = crop.baseTemp;
    upperTemp = crop.upperTemp;

    if (selectedLocation) {
      calculateHeatUnits(selectedLocation.lat, selectedLocation.lon);
    }
  }

  function toggleHeatMap() {
    if (heatMapLayer) {
      map.removeLayer(heatMapLayer);
      heatMapLayer = null;
    } else {
      createHeatMapOverlay();
    }
  }

  async function createHeatMapOverlay() {
    const bounds = map.getBounds();
    const settings = {
      crop: selectedCrop,
      baseTemp,
      upperTemp,
      timePeriod,
      method: calculationMethod
    };

    try {
      const overlayData = await WindyDataAdapter.generateHeatMapData(bounds, settings);

      // Create Leaflet heat map layer
      // Note: In a real implementation, you would use a proper heat map library
      // like Leaflet.heat or create custom canvas overlay

      const heatPoints = overlayData.data.map((point: any) => [
        point.lat,
        point.lon,
        point.intensity
      ]);

      // Mock heat map layer creation
      console.log('Heat map data generated:', heatPoints.length, 'points');

    } catch (error) {
      console.error('Failed to create heat map:', error);
    }
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
    <p>Growing Degree Days Calculator</p>
  </header>

  <div class="controls">
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

    <button class="heat-map-toggle" on:click={toggleHeatMap}>
      {heatMapLayer ? 'Hide' : 'Show'} Heat Map
    </button>
  </div>

  {#if selectedLocation}
    <div class="location-info">
      <p><strong>Selected Location:</strong> {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}</p>
    </div>
  {/if}

  {#if isLoading}
    <div class="loading">
      <p>🔄 Calculating heat units…</p>
    </div>
  {/if}

  {#if heatUnitData}
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

  <div class="instructions">
    <h3>How to Use</h3>
    <ul>
      <li>🎯 Click anywhere on the map to calculate heat units for that location</li>
      <li>🌾 Select your crop type for automatic temperature thresholds</li>
      <li>⚙️ Adjust base and upper temperatures for custom varieties</li>
      <li>📊 Toggle heat map overlay to see regional GDD distribution</li>
      <li>📈 Monitor crop development stages and harvest timing</li>
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

  .controls {
    margin-bottom: 20px;
  }

  .control-group {
    margin-bottom: 12px;
  }

  .control-group label {
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

  .heat-map-toggle {
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

  .heat-map-toggle:hover {
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
