import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableScenarioComponent } from './table-scenario.component';

describe('TableScenarioComponent', () => {
  let component: TableScenarioComponent;
  let fixture: ComponentFixture<TableScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableScenarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
