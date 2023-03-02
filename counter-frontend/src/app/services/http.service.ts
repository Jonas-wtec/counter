import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService{

  private database_port = 3000;
  private url: string = `http://192.168.31.80:${this.database_port}/counts`;
  private location: undefined | string;

  currentCount$: Subject<number> = new Subject<number>();
  allLocations$: Subject<string[]> = new Subject<string[]>();

  constructor(private http: HttpClient) {
    this.currentCount$.subscribe(newNumber => this.changeCount(newNumber));
    this.getLocations();
  }

  getLocations(): void {
    console.log("Went into ngOninit")
    this.http.get(this.url).subscribe((res:any) => {
      console.log(res);
      if (!res.length) {
        this.allLocations$.next([]);
        console.log("Returned [] because of !res.length")
        return
      }
      if (!Array.isArray(res)){
        this.allLocations$.next([]);
        console.log("Returned [] because of no Array")
        return
      }
      const test = res.map((element: any) => {
        if (element.hasOwnProperty('location')){
          return element['location'];
        }
      })
      this.allLocations$.next(test);
      console.log("allLocations are set to"+ test);
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
    console.log("TEGFJHSG")
    if (!this.location) { console.error('this.location is undefined!'); return }
    this.http.post(this.url, { count: number, location: this.location })
      .subscribe((res: any) => {
        if (res.length) {
          this.currentCount$.next(res[0].count);
        }
      })
  }

}
