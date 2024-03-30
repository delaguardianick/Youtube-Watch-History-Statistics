import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotsMainComponent } from './plots-main.component';

describe('PlotsMainComponent', () => {
  let component: PlotsMainComponent;
  let fixture: ComponentFixture<PlotsMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlotsMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlotsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
