import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TableComponent } from './components/table/table.component';
import { AboutComponent } from './components/about/about.component';

const appRoutes: Routes = [
  { path: '', component: TableComponent },
  { path: 'about', component: AboutComponent }
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
