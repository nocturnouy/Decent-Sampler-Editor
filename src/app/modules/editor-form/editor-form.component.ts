import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CdkDragEnd } from "@angular/cdk/drag-drop";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import {MatAccordion} from '@angular/material/expansion';




declare function install(): any;
declare var jscolor: any;



@Component({
  selector: 'app-editor-form',
  templateUrl: './editor-form.component.html',
  styleUrls: ['./editor-form.component.scss']
})
export class EditorFormComponent implements OnInit {

  @ViewChild(MatAccordion)
  accordion: MatAccordion = new MatAccordion;


  Object = Object;
  editorForm: any;
  fileUrl: SafeResourceUrl | undefined;



  //variables for layout
  uiDisplayx: any;
  uiDisplayy: any;

  // array for selects
  parameters: any[] = ['FX_REVERB_WET_LEVEL', 'FX_REVERB_ROOM_SIZE', 'FX_REVERB_DAMPING']




  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
    this.editorForm = this.fb.group({
      uiProperties: this.fb.group({
        width: [{ value: 812, disabled: true}],
        height: [{ value: 375, disabled: true}]
      }, { updateOn: 'blur' }),
      ui: this.fb.array([],{ updateOn: 'submit' }),
      groups: this.fb.array([],{ updateOn: 'submit' }),
      effects: this.fb.array([])
    }
    
    );


  }


  get ui(): FormArray {
    return this.editorForm.get('ui') as FormArray;
  }
  get groups(): FormArray {
    return this.editorForm.get('groups') as FormArray;
  }
  get effects(): FormArray {
    return this.editorForm.get('effects') as FormArray;
  }




  // getPropertyList(key, parent) {
  //   console.log(this.editorForm.controls[parent].value[key].properties)
  //   return this.editorForm.controls[parent].value[key].properties as FormArray;
  // }

  sectionElements(key: string | number) {
    return this.editorForm.controls[key] as FormArray;
  }



  addElement(key: any,parent: any) {
    let element: any = this.fb.group({
      type: key,
      properties: this.getProperties(key),
      binding: this.fb.group({
        type: 'effect',
        level: 'instrument',
        position: 0,
        parameter: ''
      })
    })
    const array = this.sectionElements(parent);
    array.push(element)
    
  }



  getProperties(key: string) {
    let properties: any;
    if (key === 'knob') {
      properties = this.fb.group({
        x: 0,
        y: 0,
        //width: 90,
        //textSize: 16,
        //textColor:"AA000000" ,
        //trackForegroundColor:"CC000000" ,
        //trackBackgroundColor:"66999999" ,
        label:"Knob Name" ,
        //type:"float" ,
        minValue:0.0 ,
        maxValue:1.0 ,
        value:0.1
      })
    } else if (key === 'slider') {
      properties = this.fb.group({
        sliderX: 0,
        sliderY: 0
      })
    } else if (key === 'keyboard') {
      properties = this.fb.group({
        loNote: 0,
        hiNote: 11,
        color: 'FF0000FF'
      })
    } else if (key === 'sample') {
      properties = this.fb.group({
        loNote: 0,
        hiNote:127,
        rootNote:60,
        path: "samples/C4.wav"
      })
    } else if (key === 'reverb') {
      properties = this.fb.group({
        roomSize:0.7,
        damping:0.3,
        wetLevel:1
      })
    }

    return properties;
  }

  

  deleteItem(index: number, parent: any) {
    this.sectionElements(parent).removeAt(index);
    this.submitForm(this.editorForm.value)
  }

  dragEnd($event: CdkDragEnd) {
    const event = $event.source.element.nativeElement.id
    const properties = this.ui.controls[event].controls.properties
    const position = $event.source.getFreeDragPosition()
    const element = $event.source.element.nativeElement
    

    properties.patchValue({
      x: Math.round(position.x + element.offsetLeft),
      y: Math.round(position.y + element.offsetTop)
    })
    this.submitForm(this.editorForm.value)
  }

  checkType(key: any) {
    return typeof key;
  }
  debugger(){
    debugger
  }
  
  // TODO: check why this is triggering constantly / its a known bug, could not found solution
  getTooltip(key:any) {
    const tooltips = {
      uiWidth: 'This element is disabled for now',
      uiHeight: 'This element is disabled for now'
    }
    
    return tooltips[key as keyof typeof tooltips]

  }



  colorKeys(x: any[]) {
    var keys = x.filter((key: { type: string; }) => key.type === 'keyboard')

    Array.from(document.querySelectorAll('.piano-keys i'))
      .forEach(e => e.removeAttribute('style'));

    keys.map((key: { properties: { loNote: any; hiNote: any; color: any; }; }) => {
      let loNote = key.properties.loNote
      let hiNote = key.properties.hiNote
      let color = key.properties.color

      for (let step = loNote; step <= hiNote; step++) {
        console.log(color)
        document.getElementById('cc-' + step)?.setAttribute('style', 'background-color: #' + color)
      }
    })
  }

  async submitForm(x: any) {
    document.getElementById('submit').click()
    
    let resultCont = document.getElementById('result');
    let formValue = x;
    console.log(x)
    this.colorKeys(this.editorForm.value.ui)
    
    resultCont.textContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <DecentSampler minVersion="1.0.0">
      <!-- TODO: once width and height for the ui gets enabled I should replace this with the get value of those controls -->
      <ui width="${this.uiDisplayx}" height="${this.uiDisplayy}" layoutMode="relative" bgMode="top_left">
      <tab name="main"> 
        ${formValue.ui.map(element =>  {
          let el:any
          if(element.type === 'knob'){
            el = `<labeled-knob 
                        x="${element.properties.x}" 
                        y="${element.properties.y}" 
                        width="90" 
                        textSize="16" 
                        textColor="AA000000" 
                        trackForegroundColor="CC000000" 
                        trackBackgroundColor="66999999" 
                        label="${element.properties.label}" 
                        type="float" 
                        minValue="${element.properties.minValue}" 
                        maxValue="${element.properties.maxValue}" 
                        value="${element.properties.value}">
                        <binding 
                          type="${element.binding.type}" 
                          level="${element.binding.level}" 
                          position="${element.binding.position}"
                          parameter="${element.binding.parameter}" 
                          translation="linear" 
                          translationOutputMin="0" 
                          translationOutputMax="1"
                          />
                      </labeled-knob>
          `
          }
          return  el? el : ''
        }).join('')}
      </tab>
       <keyboard>
          ${formValue.ui.map(element =>  {
            let el:any
            if(element.type === 'keyboard'){
              el = `<color 
                          loNote="${element.properties.loNote}" 
                          hiNote="${element.properties.hiNote}" 
                          color="${(element.properties.color.slice(6,8) + element.properties.color.slice(0,6))}" />
                          `
            }
            return el? el: ''
          } ).join('')}
        </keyboard>
      </ui>
      <groups attack="0.000" decay="25" sustain="1.0" release="0.430" volume="-3dB">
        <group>
          ${formValue.groups.map(element => {
            let el: any
            if (element.type === 'sample') {
              el = `<sample 
                          loNote="${element.properties.loNote}" 
                          hiNote="${element.properties.hiNote}" 
                          rootNote="${element.properties.rootNote}" 
                          path="${element.properties.path}" 
                          
                          />
                          `
            }
            return el ? el : ''
          }).join('')}
        </group>
      </groups>
      <effects>
       ${formValue.effects.map(element => {
         let el: any
         if (element.type === 'reverb') {
           el = `<effect type="reverb" 
                         roomSize="${element.properties.roomSize}" 
                         damping="${element.properties.damping}" 
                         wetLevel="${element.properties.wetLevel}" 
                          
                          />
                          `
         }
         return el ? el : ''
       }).join('')}
      </effects>
      <midi>
        <!-- This causes MIDI CC 1 to control the 4th knob (cutoff) -->
        <cc number="1">
          <binding level="ui" type="control" parameter="VALUE" position="3" 
                  translation="linear" translationOutputMin="0" 
                  translationOutputMax="1" />
        </cc>
      </midi>
    </DecentSampler>
    `
   
    jscolor.install()

  }

  fileDownload() {
    document.getElementById('submit')?.click()

    const data:any = document.getElementById('result')?.textContent;
    const blob = new Blob([data], { type: 'application/octet-stream' });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }
  ngOnInit() : void { 
    //setting values for layout
    this.uiDisplayx = this.editorForm.get('uiProperties.width').value
    this.uiDisplayy = this.editorForm.get('uiProperties.height').value


   
    
  }

  
  displayPicker() {
    jscolor.install()
  }


}
