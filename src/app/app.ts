import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapComponent } from './map/map.component';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MapComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('civicPath-frontend');
  private readonly seoService = inject(SeoService);

  constructor() {
    this.seoService.initRouteTracking();
  }
}
