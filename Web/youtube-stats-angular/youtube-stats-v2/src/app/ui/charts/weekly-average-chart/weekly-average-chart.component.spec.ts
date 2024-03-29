import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyAverageChartComponent } from './weekly-average-chart.component';

describe('WeeklyAverageChartComponent', () => {
  let component: WeeklyAverageChartComponent;
  let fixture: ComponentFixture<WeeklyAverageChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyAverageChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeeklyAverageChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
