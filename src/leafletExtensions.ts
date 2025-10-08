import L from 'leaflet';

export class HeatMapOverlay extends L.Layer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: Array<{lat: number, lon: number, intensity: number}> = [];
  declare protected _map: L.Map;

  constructor(public options: any = {}) {
    super();
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  onAdd(map: L.Map): this {
    const pane = map.getPane(this.options.pane || 'overlayPane');
    pane?.appendChild(this.canvas);

    map.on('viewreset', this.reset, this);
    map.on('zoom', this.reset, this);
    map.on('move', this.redraw, this);

    this.reset();
    return this;
  }

  onRemove(map: L.Map): this {
    map.off('viewreset', this.reset, this);
    map.off('zoom', this.reset, this);
    map.off('move', this.redraw, this);

    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    return this;
  }

  setData(data: Array<{lat: number, lon: number, intensity: number}>) {
    this.data = data;
    this.redraw();
  }

  private reset() {
    const map = this._map as L.Map;
    const bounds = map.getBounds();
    const size = map.getSize();

    // Position canvas
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
    L.DomUtil.setPosition(this.canvas, topLeft);

    // Resize canvas
    this.canvas.width = size.x;
    this.canvas.height = size.y;

    this.redraw();
  }

  private redraw() {
    if (!this._map || !this.data.length) return;

    const map = this._map as L.Map;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Create gradient for heat visualization
    const gradient = this.ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');      // Red (high)
    gradient.addColorStop(0.25, 'rgba(255, 165, 0, 0.8)'); // Orange
    gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.8)');  // Yellow
    gradient.addColorStop(0.75, 'rgba(0, 255, 0, 0.8)');   // Green
    gradient.addColorStop(1, 'rgba(0, 0, 255, 0.8)');      // Blue (low)

    // Draw heat points
    this.data.forEach(point => {
      const pixelPoint = map.latLngToContainerPoint([point.lat, point.lon]);

      if (pixelPoint.x >= 0 && pixelPoint.x <= this.canvas.width &&
          pixelPoint.y >= 0 && pixelPoint.y <= this.canvas.height) {
        this.drawHeatPoint(pixelPoint.x, pixelPoint.y, point.intensity);
      }
    });
  }

  private drawHeatPoint(x: number, y: number, intensity: number) {
    const radius = 20;
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);

    // Color based on intensity
    const alpha = Math.min(0.8, intensity);
    let color: string;

    if (intensity > 0.8) color = `rgba(255, 0, 0, ${alpha})`;
    else if (intensity > 0.6) color = `rgba(255, 165, 0, ${alpha})`;
    else if (intensity > 0.4) color = `rgba(255, 255, 0, ${alpha})`;
    else if (intensity > 0.2) color = `rgba(0, 255, 0, ${alpha})`;
    else color = `rgba(0, 0, 255, ${alpha})`;

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
