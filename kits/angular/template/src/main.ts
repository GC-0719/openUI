import 'zone.js';
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { ShowcaseComponent } from './showcase.component';
import './styles/openui.css';
import './styles/demo.css';

const params = new URLSearchParams(window.location.search);
const isPreview = params.has('preview');

bootstrapApplication(isPreview ? ShowcaseComponent : AppComponent).catch(console.error);
