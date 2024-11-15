import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {
  constructor(private router: Router){

  }
  goToHomePage(){
    this.router.navigate(['/homepage']);

  }
}
