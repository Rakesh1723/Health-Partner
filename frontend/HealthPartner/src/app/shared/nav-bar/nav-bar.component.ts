import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class NavBarComponent {
  isProfileMenuOpen = false;
  constructor(private router: Router) {}

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout() {
    sessionStorage.removeItem('hp-token');
    this.router.navigate(['/landingpage']);
  }
}
