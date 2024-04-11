import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeRangeAverageChartComponent } from './time-range-average-chart.component';

describe('WeeklyAverageChartComponent', () => {
  let component: TimeRangeAverageChartComponent;
  let fixture: ComponentFixture<TimeRangeAverageChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeRangeAverageChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeRangeAverageChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
