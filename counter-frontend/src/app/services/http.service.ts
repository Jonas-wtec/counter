import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService{

  private database_port = 3000;
  private url: string = `http://192.168.31.80:${this.database_port}/counts`;
  private location: undefined | string;

  currentCount$: Subject<number> = new Subject<number>();
  allLocations$: ReplaySubject<Set<string>> = new ReplaySubject<Set<string>>(1);

  constructor(private http: HttpClient) {
    this.currentCount$.subscribe(newNumber => this.changeCount(newNumber));
    this.getLocations();
  }

  getLocations(): void {
    this.http.get(this.url).subscribe((res:any) => {
      if (!res.length) {
        this.allLocations$.next(new Set([]));
        return
      }
      if (!Array.isArray(res)){
        this.allLocations$.next(new Set([]));
        return
      }
      const location = new Set(res.map((element: any) => {
        if (element.hasOwnProperty('location')){
          return element['location'];
        }
      }));
      this.allLocations$.next(location);
    })
  }


  reqLocationCount(location: string) {
    this.location = location;
    this.http.post(this.url, {
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
    this.http.post(this.url, { count: number, location: this.location })
      .subscribe((res: any) => {
        if (res.length) {
          this.currentCount$.next(res[0].count);
        }
      })
  }

}
