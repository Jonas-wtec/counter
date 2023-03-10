import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-change-location',
  templateUrl: './change-location.component.html',
  styleUrls: ['./change-location.component.scss']
})
export class ChangeLocationComponent implements OnInit {
  allLocationFC = new FormControl('');
  options: string[] | undefined;
  filteredOptions: Observable<string[]> | undefined;

  constructor(
    public dialogRef: MatDialogRef<ChangeLocationComponent>,
    private http: HttpService,
  ) { }

  ngOnInit(): void {
    this.http.allLocations$.subscribe(locations => {
      this.options = locations;
      this.filteredOptions = this.allLocationFC.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || '')),
      );
    });
  }

  private _filter(value: string): string[] {
    if (!this.options) {return []}

    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
