import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorFormComponent } from './editor-form.component';

describe('EditorFormComponent', () => {
  let component: EditorFormComponent;
  let fixture: ComponentFixture<EditorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
