import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { ChangeLocationComponent } from '../change-location/change-location.component';
import { DemoBannerComponent } from '../demo/demo-banner/demo-banner.component';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  currentLocation: string | undefined;

  currentCount$ = this.http.currentCount$;

  constructor(public dialog: MatDialog, private http: HttpService) {
  }

  ngOnInit(): void {

    const dialogRef = this.dialog.open(DemoBannerComponent);

    dialogRef.afterClosed().subscribe((result: FormControl | undefined) => {
      const x = localStorage.getItem("currentLocation")
      if (x) {
        this.currentLocation = x;
        this.http.reqLocationCount(x);
      } else {
        this.openDialog();
      }
    });
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(ChangeLocationComponent);

    dialogRef.afterClosed().subscribe((result: FormControl | undefined) => {
      if (!result) { return }
      console.log(`Dialog result: ${result}`);
      if (!result.value || typeof result.value !== "string") { return }
      localStorage.setItem("currentLocation", result.value);
      this.currentLocation = result.value;
      this.http.reqLocationCount(result.value);
    });
  }

  addCount() {
    this.currentCount$.next(this.currentCount$.getValue() + 1);
  }

  removeCount() {
    if (this.currentCount$.getValue() === 0) { return }
    this.currentCount$.next(this.currentCount$.getValue() - 1);
  }

}
