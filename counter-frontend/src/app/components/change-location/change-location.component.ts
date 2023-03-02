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
export class ChangeLocationComponent implements OnInit{

  name: string | undefined;
  myControl = new FormControl('');
  options: string[] = [''];
  filteredOptions: Observable<string[]> | undefined;

  constructor(
    public dialogRef: MatDialogRef<ChangeLocationComponent>,
    private http: HttpService,
  ) { }

  ngOnInit(): void {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.http.allLocations$.subscribe(locations => this.options = locations);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
