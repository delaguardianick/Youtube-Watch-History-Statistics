import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourlyAverageChartComponent } from './hourly-average-chart.component';

describe('HourlyAverageChartComponent', () => {
  let component: HourlyAverageChartComponent;
  let fixture: ComponentFixture<HourlyAverageChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HourlyAverageChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HourlyAverageChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
