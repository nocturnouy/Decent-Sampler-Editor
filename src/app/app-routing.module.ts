import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { ChangelogComponent } from './modules/changelog/changelog.component';

const routes: Routes = [
  {path:'', component: HomeComponent},
  {path:'log', component: ChangelogComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
