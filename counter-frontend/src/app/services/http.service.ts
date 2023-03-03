import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService{

  private databasePort = 3000;
  private countEndpoint = '/counts'
  private locationsEndpoint= '/locations'
  private cUrl: string = `http://192.168.31.80:${this.databasePort}${this.countEndpoint}`;
  private lUrl: string = `http://192.168.31.80:${this.databasePort}${this.locationsEndpoint}`;
  private location: undefined | string;

  currentCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  allLocations$: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);

  constructor(private http: HttpClient) {
    this.currentCount$.subscribe(newNumber => this.changeCount(newNumber));
    this.getLocations();
  }

  getLocations(): void {
    this.http.get(this.lUrl).subscribe((res:any) => {
      if (!res.length) {
        this.allLocations$.next([]);
        return
      }
      if (!Array.isArray(res)){
        this.allLocations$.next([]);
        return
      }
      const locations = res.map((element: any) => {
        if (element.hasOwnProperty('location')){
          return element['location'];
        }
      });
      this.allLocations$.next(locations);
    })
  }


  reqLocationCount(location: string) {
    this.location = location;
    this.http.post(this.cUrl, {
      get: "get",
      location: location
    }).subscribe((res: any) => {
      if (res.length) {
        this.currentCount$.next(res[0].count);
      } else {
        this.currentCount$.next(0);
      }
    })
  }

  changeCount(number: number) {
    if (!this.location) { console.error('this.location is undefined!'); return }
    this.http.post(this.cUrl, { count: number, location: this.location })
      .subscribe((res: any) => {
        if (res.length) {
          this.currentCount$.next(res[0].count);
        }
      })
  }

}
