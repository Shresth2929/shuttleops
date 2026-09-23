import { Component, signal, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="shell-layout">
      <!-- Desktop / Mobile Sidebar -->
      <app-sidebar
        [isCollapsed]="isSidebarCollapsed()"
        [class.mobile-open]="isMobileDrawerOpen()"
        (navClicked)="onMobileNavClicked()"
      ></app-sidebar>

      <!-- Mobile Backdrop Overlay -->
      <div
        *ngIf="isMobileDrawerOpen()"
        class="mobile-backdrop"
        (click)="closeMobileDrawer()"
        aria-hidden="true"
      ></div>

      <!-- Main Shell Area -->
      <div class="shell-main">
        <app-header (toggleSidebar)="toggleMobileSidebar()"></app-header>
        
        <main class="shell-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell-layout {
      display: flex;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background-color: var(--so-bg);
      position: relative;
    }

    .shell-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      min-width: 0;
    }

    .shell-content {
      flex: 1;
      overflow-y: auto;
      background-color: var(--so-bg);
      position: relative;
    }

    .mobile-backdrop {
      display: none;

      @media (max-width: 1024px) {
        display: block;
        position: fixed;
        inset: 0;
        background-color: rgba(15, 23, 42, 0.6);
        z-index: 95;
      }
    }

    @media (max-width: 1024px) {
      app-sidebar {
        position: fixed;
        left: -280px;
        top: 0;
        bottom: 0;
        z-index: 100;
        transition: transform var(--so-transition-base);

        &.mobile-open {
          transform: translateX(280px);
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent {
  readonly isSidebarCollapsed = signal(false);
  readonly isMobileDrawerOpen = signal(false);

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 1024 && this.isMobileDrawerOpen()) {
      this.isMobileDrawerOpen.set(false);
    }
  }

  toggleMobileSidebar(): void {
    this.isMobileDrawerOpen.update(open => !open);
  }

  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }

  onMobileNavClicked(): void {
    if (window.innerWidth <= 1024) {
      this.closeMobileDrawer();
    }
  }
}
