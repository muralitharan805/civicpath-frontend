import { Component, ChangeDetectionStrategy, signal, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import * as L from 'leaflet';
import * as wellknown from 'wellknown';
import { ConstituencyService, ConstituencyResponse } from '../services/constituency.service';

@Component({
  selector: 'app-map',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="app-map-container">
      <!-- Full-screen leaflet map -->
      <div #map id="map" class="full-screen-map"></div>

      <!-- Floating Glassmorphic control and results card -->
      <div class="floating-panel animate-slide-up">
        <mat-card class="glassmorphism-card">
          <mat-card-header>
            <div class="header-content">
              <div class="logo-accent"></div>
              <mat-card-title>CivicPath</mat-card-title>
              <mat-card-subtitle>Tamil Nadu Assembly Constituencies</mat-card-subtitle>
            </div>
          </mat-card-header>

          <mat-card-content>
            <p class="description-text">
              Identify and map any constituency coordinates using live geographic boundary datasets.
            </p>

            <form [formGroup]="searchForm" (ngSubmit)="searchLocation()">
              <div class="inputs-container">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Latitude</mat-label>
                  <input matInput type="number" formControlName="latitude" step="any" placeholder="e.g. 11.0619">
                  <mat-icon matSuffix class="material-symbols-rounded">explore</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Longitude</mat-label>
                  <input matInput type="number" formControlName="longitude" step="any" placeholder="e.g. 77.0005">
                  <mat-icon matSuffix class="material-symbols-rounded">explore</mat-icon>
                </mat-form-field>
              </div>

              <div class="actions-container">
                <button mat-flat-button type="submit" class="gradient-btn" [disabled]="isLoading() || searchForm.invalid">
                  <mat-icon class="material-symbols-rounded">search</mat-icon>
                  Search Location
                </button>
                
                <button mat-stroked-button type="button" class="secondary-btn" (click)="locateMe()" [disabled]="isLoading()">
                  <mat-icon class="material-symbols-rounded">my_location</mat-icon>
                  Locate Me
                </button>
              </div>
            </form>

            @if (error()) {
              <div class="error-msg animate-fade-in">
                <mat-icon class="material-symbols-rounded">error</mat-icon>
                <span>{{ error() }}</span>
              </div>
            }

            @if (isLoading()) {
              <mat-progress-bar mode="indeterminate" class="spinner-loader animate-fade-in"></mat-progress-bar>
            }

            @if (constituency()) {
              <div class="results-panel animate-slide-up">
                <h4 class="results-heading">Assembly Target</h4>
                
                <div class="result-item">
                  <span class="label">Constituency (AC)</span>
                  <span class="valueHighlight">{{ constituency()?.ac_name }} ({{ constituency()?.ac_no }})</span>
                </div>

                <div class="result-item">
                  <span class="label">Parliamentary (PC)</span>
                  <span class="value">{{ constituency()?.pc_name }}</span>
                </div>

                <div class="result-item">
                  <span class="label">District</span>
                  <span class="value">{{ constituency()?.dist_name }}</span>
                </div>

                <div class="result-item">
                  <span class="label">State</span>
                  <span class="value">{{ constituency()?.st_name }}</span>
                </div>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .app-map-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    
    .full-screen-map {
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    
    .floating-panel {
      position: absolute;
      top: 24px;
      left: 24px;
      width: 380px;
      max-height: calc(100vh - 48px);
      z-index: 999;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
    }
    
    .glassmorphism-card {
      background: var(--glass-bg) !important;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border) !important;
      border-radius: 24px !important;
      box-shadow: var(--shadow-premium) !important;
      padding: 16px 8px;
      overflow-y: auto;
    }
    
    .header-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 8px;
      padding: 4px 8px;
    }
    
    .logo-accent {
      width: 40px;
      height: 4px;
      background: var(--primary-gradient);
      border-radius: 2px;
      margin-bottom: 6px;
    }
    
    mat-card-title {
      font-size: 1.5rem !important;
      font-weight: 800 !important;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
    
    mat-card-subtitle {
      font-size: 0.8rem !important;
      font-weight: 500 !important;
      color: var(--text-secondary) !important;
    }
    
    .description-text {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.4;
      margin-bottom: 16px;
      padding: 0 8px;
    }
    
    .inputs-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 0 8px;
    }
    
    .full-width {
      width: 100%;
    }
    
    ::ng-deep .mat-mdc-text-field-wrapper {
      border-radius: 12px !important;
      background-color: rgba(255, 255, 255, 0.45) !important;
    }
    
    .actions-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 12px;
      padding: 0 8px;
    }
    
    .gradient-btn {
      background: var(--primary-gradient) !important;
      color: white !important;
      border-radius: 12px !important;
      padding: 22px !important;
      font-weight: 600 !important;
      font-size: 0.95rem !important;
      border: none !important;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.2) !important;
      transition: all 0.2s ease !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .gradient-btn:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3) !important;
    }
    
    .gradient-btn:active:not([disabled]) {
      transform: translateY(0);
    }
    
    .secondary-btn {
      border-radius: 12px !important;
      padding: 22px !important;
      font-weight: 600 !important;
      font-size: 0.95rem !important;
      border-color: #cbd5e1 !important;
      color: var(--text-primary) !important;
      transition: all 0.2s ease !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .secondary-btn:hover:not([disabled]) {
      background: rgba(0, 0, 0, 0.03) !important;
      border-color: #94a3b8 !important;
    }
    
    .error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #e11d48;
      background: #fff1f2;
      border: 1px solid #ffe4e6;
      padding: 10px 12px;
      border-radius: 12px;
      margin-top: 14px;
      margin-left: 8px;
      margin-right: 8px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    
    .error-msg mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .spinner-loader {
      margin-top: 14px;
      border-radius: 2px;
    }
    
    .results-panel {
      margin-top: 20px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.7);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-left: 8px;
      margin-right: 8px;
    }
    
    .results-heading {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .result-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      padding-bottom: 6px;
    }
    
    .result-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    .label {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .valueHighlight {
      font-size: 1rem;
      font-weight: 700;
      color: #4f46e5;
    }
    
    /* Responsive Styling for Mobile */
    @media (max-width: 600px) {
      .floating-panel {
        top: auto;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        max-height: 50vh;
        border-radius: 24px 24px 0 0 !important;
      }
      .glassmorphism-card {
        border-radius: 24px 24px 0 0 !important;
        border-bottom: none !important;
        border-left: none !important;
        border-right: none !important;
        padding-bottom: 30px;
      }
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

  // Signal State
  isLoading = signal(false);
  error = signal<string | null>(null);
  constituency = signal<ConstituencyResponse | null>(null);

  // Reactive Form
  searchForm = new FormGroup({
    latitude: new FormControl<number>(11.061930822443282, { nonNullable: true, validators: [Validators.required] }),
    longitude: new FormControl<number>(77.00057346197408, { nonNullable: true, validators: [Validators.required] })
  });

  ngAfterViewInit() {
    this.initMap();
    // Default search on load
    this.searchLocation();
  }

  private initMap() {
    const lat = this.searchForm.controls.latitude.value;
    const lng = this.searchForm.controls.longitude.value;

    this.map = L.map(this.mapElement.nativeElement).setView([lat, lng], 10);
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
          this.searchForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          this.searchLocation();
        },
        (err) => {
          console.error(err);
          this.error.set('Could not get your location. Please check browser permissions.');
          this.isLoading.set(false);
        }
      );
    } else {
      this.error.set('Geolocation is not supported by this browser.');
    }
  }

  searchLocation() {
    if (this.searchForm.invalid) {
      this.error.set('Please provide valid latitude and longitude');
      return;
    }

    const { latitude, longitude } = this.searchForm.getRawValue();

    this.isLoading.set(true);
    this.error.set(null);
    this.constituency.set(null);

    this.constituencyService.getConstituency(latitude, longitude).subscribe({
      next: (data) => {
        this.constituency.set(data);
        this.isLoading.set(false);
        this.renderMapData(data, latitude, longitude);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to fetch constituency data.');
        this.isLoading.set(false);
      }
    });
  }

  private renderMapData(data: ConstituencyResponse, lat: number, lng: number) {
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
            color: '#4f46e5',
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.25,
            fillColor: '#8b5cf6'
          }
        }).addTo(this.map);

        // Fit map to polygon bounds
        this.map.fitBounds(this.geojsonLayer.getBounds(), {
          padding: [50, 50]
        });
      }

      // Add a custom marker at the requested coordinates
      this.marker = L.marker([lat, lng]).addTo(this.map);
      this.marker.bindPopup(`<b>Requested Point</b><br>Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}`).openPopup();      
    } catch (e) {
      console.error('Error parsing WKT or rendering map:', e);
      this.error.set('Failed to render map polygon.');
    }
  }
}
