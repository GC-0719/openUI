import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `<nav class="ou-navbar"><ng-content></ng-content></nav>`,
})
export class NavbarComponent {}

@Component({
  selector: 'ou-navbar-brand',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="ou-navbar-brand"><ng-content></ng-content></div>`,
})
export class NavbarBrandComponent {}

@Component({
  selector: 'ou-navbar-actions',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="ou-navbar-actions"><ng-content></ng-content></div>`,
})
export class NavbarActionsComponent {}
