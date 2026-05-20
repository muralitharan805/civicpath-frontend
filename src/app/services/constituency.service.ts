import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface ConstituencyResponse {
  ogc_fid: number;
  st_name: string;
  dist_name: string;
  ac_no: string;
  ac_name: string;
  pc_name: string;
  geom_wkt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConstituencyService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getConstituency(latitude: number, longitude: number): Observable<ConstituencyResponse> {
    const payload = { latitude, longitude };
    return this.http.post<ConstituencyResponse>(`${this.apiUrl}/assembly-constituencies/inside`, payload);
  }
}
