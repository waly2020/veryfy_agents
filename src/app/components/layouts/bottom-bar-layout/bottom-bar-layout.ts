import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from '../../items/bottom-nav/bottom-nav';

@Component({
  selector: 'app-bottom-bar-layout',
  standalone: true,
  imports: [RouterOutlet, BottomNav],
  templateUrl: './bottom-bar-layout.html',
  styleUrl: './bottom-bar-layout.scss',
})
export class BottomBarLayout {}
