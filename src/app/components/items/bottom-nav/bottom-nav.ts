import { Component } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface BottomNavItem {
  label: string;
  path: string;
  icon: 'home' | 'tasks' | 'clients' | 'companies' | 'profile';
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf, NgSwitch, NgSwitchCase],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  protected readonly items: BottomNavItem[] = [
    { label: 'Accueil', path: '/', icon: 'home' },
    { label: 'Interventions', path: '/interventions', icon: 'tasks' },
    { label: 'Clients', path: '/clients', icon: 'clients' },
    { label: 'Entreprises', path: '/entreprises', icon: 'companies' },
    { label: 'Profil', path: '/profil', icon: 'profile' },
  ];
}
