import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgComponent } from './ag/ag.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [AgComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    MatTableModule,
    MatSelectModule,
  ],
})
export class AgModule {}
