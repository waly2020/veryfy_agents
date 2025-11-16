import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsChantierComponent } from './details-chantier.component';

describe('DetailsChantierComponent', () => {
  let component: DetailsChantierComponent;
  let fixture: ComponentFixture<DetailsChantierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsChantierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsChantierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
