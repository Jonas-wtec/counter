import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { ChangeLocationComponent } from '../change-location/change-location.component';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  currentLocation: string | undefined;

  currentCount$ = this.http.currentCount$;
  currentCount: number = 0;

  constructor(public dialog: MatDialog, private http: HttpService) {
    this.currentCount$.subscribe(num => this.currentCount = num);
  }

  ngOnInit(): void {
    const x = localStorage.getItem("currentLocation")
    if (x) {
      this.currentLocation = x;
      this.http.reqLocationCount(x);
    } else {
      this.openDialog();
    }
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(ChangeLocationComponent, {disableClose: true});

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (!result || typeof result !== "string") { return }
      localStorage.setItem("currentLocation", result);
      this.currentLocation = result;
      this.http.reqLocationCount(result);
    });
  }

  addCount(){
    this.currentCount$.next(this.currentCount + 1);
  }

  removeCount(){
    if(this.currentCount === 0) {return}
    this.currentCount$.next(this.currentCount - 1);
  }

}