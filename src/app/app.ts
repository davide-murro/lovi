import { Component, signal } from '@angular/core';
import { Header } from './shared/header/header';
import { Body } from "./shared/body/body";
import { Footer } from "./shared/footer/footer";

@Component({
  selector: 'app-root',
  imports: [
    Header,
    Body,
    Footer
],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
