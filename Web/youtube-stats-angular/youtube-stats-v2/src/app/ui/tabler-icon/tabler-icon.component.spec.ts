import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablerIconComponent } from './tabler-icon.component';

describe('TablerIconComponent', () => {
  let component: TablerIconComponent;
  let fixture: ComponentFixture<TablerIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablerIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablerIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
