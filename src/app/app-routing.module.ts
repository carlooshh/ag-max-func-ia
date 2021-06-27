import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgComponent } from './ag/ag/ag.component';

const routes: Routes = [
  {
    path: '',
    component: AgComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
