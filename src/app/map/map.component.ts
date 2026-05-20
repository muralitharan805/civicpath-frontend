import { Component, ChangeDetectionStrategy, signal, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import * as wellknown from 'wellknown';
import { ConstituencyService, ConstituencyResponse } from '../services/constituency.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="map-container-wrapper">
      <div class="controls">
        <h3>Find Your Assembly Constituency</h3>
        
        <div class="input-group">
          <label>Latitude:</label>
          <input type="number" [(ngModel)]="inputLat" step="any" placeholder="e.g. 11.0619">
        </div>
        
        <div class="input-group">
          <label>Longitude:</label>
          <input type="number" [(ngModel)]="inputLng" step="any" placeholder="e.g. 77.0005">
        </div>
        
        <div class="button-group">
          <button (click)="searchLocation()" [disabled]="isLoading()">Search Custom Location</button>
          <button (click)="locateMe()" class="secondary" [disabled]="isLoading()">Locate Me</button>
        </div>

        @if (error()) {
          <div class="error-msg">{{ error() }}</div>
        }

        @if (constituency()) {
          <div class="results-card">
            <h4>Results</h4>
            <p><strong>Constituency (AC):</strong> {{ constituency()?.ac_name }} ({{ constituency()?.ac_no }})</p>
            <p><strong>Parliamentary (PC):</strong> {{ constituency()?.pc_name }}</p>
            <p><strong>District:</strong> {{ constituency()?.dist_name }}</p>
            <p><strong>State:</strong> {{ constituency()?.st_name }}</p>
          </div>
        }
      </div>

      <div class="map-frame">
        <div #map id="map" class="map"></div>
        @if (isLoading()) {
          <div class="loading-overlay">Loading...</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .map-container-wrapper {
      display: flex;
      flex-direction: row;
      height: 100vh;
      width: 100%;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .controls {
      width: 350px;
      padding: 20px;
      background: #f8f9fa;
      border-right: 1px solid #ddd;
      display: flex;
      flex-direction: column;
      gap: 15px;
      overflow-y: auto;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .button-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    button {
      padding: 10px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.2s;
    }
    button:hover {
      background: #0056b3;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    button.secondary {
      background: #6c757d;
    }
    button.secondary:hover {
      background: #5a6268;
    }
    .results-card {
      margin-top: 20px;
      padding: 15px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .error-msg {
      color: #dc3545;
      margin-top: 10px;
      font-weight: bold;
    }
    .map-frame {
      flex: 1;
      position: relative;
    }
    .map {
      height: 100%;
      width: 100%;
    }
    .loading-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      z-index: 1000;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map') mapElement!: ElementRef;
  
  private constituencyService = inject(ConstituencyService);
  private map: L.Map | undefined;
  private geojsonLayer: L.GeoJSON | undefined;
  private marker: L.Marker | undefined;

  // State
  inputLat = 11.061930822443282;
  inputLng = 77.00057346197408;
  
  isLoading = signal(false);
  error = signal<string | null>(null);
  constituency = signal<ConstituencyResponse | null>(null);

  ngAfterViewInit() {
    this.initMap();
    // Start by showing the Leaflet map and triggering a default search for demo purposes
    this.searchLocation();
  }

  private initMap() {
    this.map = L.map(this.mapElement.nativeElement).setView([this.inputLat, this.inputLng], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  locateMe() {
    if (navigator.geolocation) {
      this.isLoading.set(true);
      this.error.set(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.inputLat = position.coords.latitude;
          this.inputLng = position.coords.longitude;
          this.searchLocation();
        },
        (err) => {
          this.error.set('Could not get your location. Please check browser permissions.');
          this.isLoading.set(false);
        }
      );
    } else {
      this.error.set('Geolocation is not supported by this browser.');
    }
  }

  searchLocation() {
    if (!this.inputLat || !this.inputLng) {
      this.error.set('Please provide valid latitude and longitude');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.constituency.set(null);

    this.constituencyService.getConstituency(this.inputLat, this.inputLng).subscribe({
      next: (data) => {
        this.constituency.set(data);
        this.isLoading.set(false);
        this.renderMapData(data);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to fetch constituency data.');
        this.isLoading.set(false);
      }
    });
  }

  private renderMapData(data: ConstituencyResponse) {
    if (!this.map) return;

    // Clear existing layers
    if (this.geojsonLayer) {
      this.map.removeLayer(this.geojsonLayer);
    }
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    try {
      // Parse WKT to GeoJSON
      const geojson = wellknown.parse(data.geom_wkt);
      if (geojson) {
        this.geojsonLayer = L.geoJSON(geojson as any, {
          style: {
            color: '#e74c3c',
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.3,
            fillColor: '#e74c3c'
          }
        }).addTo(this.map);

        // Fit map to polygon bounds
        this.map.fitBounds(this.geojsonLayer.getBounds());
      }

      // Add a marker at the requested coordinates
      this.marker = L.marker([this.inputLat, this.inputLng]).addTo(this.map);
      this.marker.bindPopup(`Requested Location: ${this.inputLat}, ${this.inputLng}`).openPopup();      
    } catch (e) {
      console.error('Error parsing WKT or rendering map:', e);
      this.error.set('Failed to render map polygon.');
    }
  }
}
