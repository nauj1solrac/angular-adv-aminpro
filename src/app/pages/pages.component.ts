import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { SidebarService } from '../services/sidebar.service';

declare function customInitFucntions(): void;

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styles: [
  ]
})
export class PagesComponent implements OnInit{
  constructor(
    private settingService: SettingsService,
    private sidebarService: SidebarService
  ){}

  ngOnInit(): void {
    customInitFucntions();
    this.sidebarService.cargarMenu();
  }
}
