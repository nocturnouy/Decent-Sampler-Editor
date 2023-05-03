import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CdkDragEnd } from "@angular/cdk/drag-drop";
import { DomSanitizer } from '@angular/platform-browser';

import {MatAccordion} from '@angular/material/expansion';


declare function install(): any;
declare var jscolor: any;



@Component({
  selector: 'app-editor-form',
  templateUrl: './editor-form.component.html',
  styleUrls: ['./editor-form.component.scss']
})
export class EditorFormComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  Object = Object;
  myForm: FormGroup;
  fileUrl;





  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
    this.myForm = this.fb.group({
      uiProperties: this.fb.group({
        width:812,
        height:375
      }, { updateOn: 'blur' }),
      ui: this.fb.array([],{ updateOn: 'submit' }),
      groups: this.fb.array([],{ updateOn: 'submit' }),
      effects: this.fb.array([])
    }
    
    );


  }


  get ui(): FormArray {
    return this.myForm.get('ui') as FormArray;
  }
  get groups(): FormArray {
    return this.myForm.get('groups') as FormArray;
  }




  getPropertyList(key, parent) {
    console.log(this.myForm.controls[parent].value[key].properties)
    return this.myForm.controls[parent].value[key].properties as FormArray;
  }
  sectionElements(key) {
    return this.myForm.controls[key] as FormArray;
  }



  addElement(key,parent) {
    let element: any = this.fb.group({
      type: key,
      properties: this.getProperties(key)
    })
    
    const array = this.sectionElements(parent);
    array.push(element)
    
  }


  getProperties(key) {
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
    }
    else if (key === 'keyboard') {
      properties = this.fb.group({
        loNote: 0,
        hiNote: 11,
        color: 'FF0000FF'
      })
    }
    else if (key === 'sample') {
      properties = this.fb.group({
        loNote: 0,
        hiNote:127,
        rootNote:60,
        path: "samples/C4.wav"
      })
    }
    return properties
  }

  

  deleteItem(index: number, parent) {
    this.sectionElements(parent).removeAt(index);
  }

  dragEnd($event: CdkDragEnd) {
    const properties = this.ui.controls[$event.source.element.nativeElement.id].controls.properties
    const position = $event.source.getFreeDragPosition()
    const element = $event.source.element.nativeElement
    

    properties.patchValue({
      x: Math.round(position.x + element.offsetLeft),
      y: Math.round(position.y + element.offsetTop)
    })
    this.submitForm(this.myForm.value)
  }

  checkType(key) {
    return typeof key;
  }
  debugger(){
    debugger
  }
  
  colorKeys(x) {
    var keys = x.filter(key => key.type === 'keyboard')

    keys.map(key => {
      let loNote = key.properties.loNote
      let hiNote = key.properties.hiNote
      let color = key.properties.color

      for (let step = loNote; step <= hiNote; step++) {
        console.log(color)
        document.getElementById('cc-' + step).setAttribute('style', 'background-color: #' + color)
      }
    })
  }

  async submitForm(x) {
    document.getElementById('submit').click()
    
    let resultCont = document.getElementById('result');
    let formValue = x;

    this.colorKeys(this.myForm.value.ui)

    resultCont.textContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <DecentSampler minVersion="1.0.0">
      <ui width="${formValue.uiProperties.width}" height="${formValue.uiProperties.height}" layoutMode="relative" bgMode="top_left">
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
                        <binding type="amp" level="instrument" position="0" parameter="ENV_ATTACK" />
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
          <sample loNote="0" hiNote="127" rootNote="21" path="samples/C4.wav"/>
        </group>
      </groups>
      <effects>
        <effect type="lowpass" frequency="22000.0"/>
        <effect type="chorus"  mix="0.0" modDepth="0.2" modRate="0.2" />
        <effect type="reverb" wetLevel="0.5"/>
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

    console.log('submitted')
    
    jscolor.install()



  }

  fileDownload() {
    document.getElementById('submit').click()

    const data = document.getElementById('result').textContent;
    const blob = new Blob([data], { type: 'application/octet-stream' });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }
  ngOnInit() : void { 

    
  }

  
  displayPicker() {
    jscolor.install()
  }


}
