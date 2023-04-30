import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { EditorFormComponent } from './modules/editor-form/editor-form.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    EditorFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    HighlightModule
  ],
  providers: [{
    provide: HIGHLIGHT_OPTIONS,
    useValue: {
      fullLibraryLoader: () => import('highlight.js')
      // coreLibraryLoader: () => import('highlight.js/lib/core'),
      // languages: {
      //   css: () => import('highlight.js/lib/languages/css'),
      //   xml: () => import('highlight.js/lib/languages/xml')
      // }
    }
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
