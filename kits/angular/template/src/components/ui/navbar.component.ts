import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `<nav class="l-navbar"><ng-content></ng-content></nav>`,
})
export class NavbarComponent {}

@Component({
  selector: 'l-navbar-brand',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="l-navbar-brand"><ng-content></ng-content></div>`,
})
export class NavbarBrandComponent {}

@Component({
  selector: 'l-navbar-actions',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="l-navbar-actions"><ng-content></ng-content></div>`,
})
export class NavbarActionsComponent {}
