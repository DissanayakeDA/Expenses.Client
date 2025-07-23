import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  currentYear: number = new Date().getFullYear();

  appVersion: string = '1.0.0';

  socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com',
      icon: 'fab fa-github',
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: 'fab fa-linkedin',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com',
      icon: 'fab fa-twitter',
    },
  ];

  quickLinks = [
    { name: 'Transactions', route: '/transactions' },
    { name: 'Add Transaction', route: '/add' },
  ];

  supportLinks = [
    { name: 'Help Center', url: '#' },
    { name: 'Privacy Policy', url: '#' },
    { name: 'Terms of Service', url: '#' },
    { name: 'Contact Us', url: '#' },
  ];
}
