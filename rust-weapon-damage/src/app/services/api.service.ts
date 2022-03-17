import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { Gun } from '../Gun'

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  guns: Gun[] = [];
  gunsLeft: Gun[] = [];
  gunsSettings: any = null;
  constructor(private http: HttpClient) { }

  rootUrl = '/api';

  getGuns(): Observable<Gun[]> {
    return this.http.get<Gun[]>(this.rootUrl+"/guns");
  }
}
