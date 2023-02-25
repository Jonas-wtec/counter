import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-location',
  templateUrl: './change-location.component.html',
  styleUrls: ['./change-location.component.scss']
})
export class ChangeLocationComponent {

  name: string | undefined;

  constructor(
    public dialogRef: MatDialogRef<ChangeLocationComponent>,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
