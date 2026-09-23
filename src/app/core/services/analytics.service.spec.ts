import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AnalyticsService } from './analytics.service';
import { BookingService } from './booking.service';
import { DriverService } from './driver.service';
import { RouteService } from './route.service';
import { StorageService } from './storage.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let bookingService: BookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        provideAnimationsAsync(),
        AnalyticsService,
        BookingService,
        DriverService,
        RouteService,
        StorageService
      ]
    });

    service = TestBed.inject(AnalyticsService);
    bookingService = TestBed.inject(BookingService);
  });

  it('should compute hourly demand across 16 operating hours (06:00 to 21:00)', () => {
    const hourly = service.hourlyDemand();
    expect(hourly.length).toBe(16);
    expect(hourly[0].hour).toBe('06:00');
    expect(hourly[hourly.length - 1].hour).toBe('21:00');
  });

  it('should identify the peak booking hour', () => {
    const hourly = service.hourlyDemand();
    const peakEntries = hourly.filter(h => h.isPeak);
    expect(peakEntries.length).toBeGreaterThanOrEqual(1);

    const metrics = service.summaryMetrics();
    expect(metrics.peakHourRange).toBeTruthy();
  });

  it('should compute demand by route sorted by volume', () => {
    const routeDemand = service.routeDemand();
    expect(routeDemand.length).toBeGreaterThan(0);
    // Check descending sort
    for (let i = 0; i < routeDemand.length - 1; i++) {
      expect(routeDemand[i].totalBookings).toBeGreaterThanOrEqual(routeDemand[i + 1].totalBookings);
    }
  });

  it('should generate meaningful data-driven operational insights', () => {
    const insights = service.insights();
    expect(insights.length).toBeGreaterThanOrEqual(3);
    expect(insights[0]).toContain('Highest booking volume');
  });
});
