import { NgModule } from '@angular/core';
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


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { EditorFormComponent } from './modules/editor-form/editor-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PianoRollComponent } from './piano-roll/piano-roll.component';

@NgModule({
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
    MatTooltipModule
    
  ],
  providers: [{
    provide: HIGHLIGHT_OPTIONS,
    useValue: {
      // fullLibraryLoader: () => import('highlight.js')
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      languages: {
        //css: () => import('highlight.js/lib/languages/css'),
        xml: () => import('highlight.js/lib/languages/xml')

      }
    }
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
