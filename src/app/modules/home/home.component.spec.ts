import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';



import { AppRoutingModule } from '../../app-routing.module';
import { AppComponent } from '../../app.component';
import { HomeComponent } from './home.component';
import { EditorFormComponent } from '../editor-form/editor-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PianoRollComponent } from '../piano-roll/piano-roll.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HomeComponent,
        EditorFormComponent,
        PianoRollComponent
      ],
      imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        DragDropModule,
        HighlightModule,
        MatCardModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatExpansionModule,
        MatInputModule,
        MatTooltipModule,
        MatSelectModule

      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
