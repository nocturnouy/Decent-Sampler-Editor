import { Component, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CdkDragEnd } from "@angular/cdk/drag-drop";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatAccordion } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';

import { ChangelogComponent } from '../changelog/changelog.component';
import { TutorialComponent } from '../tutorial/tutorial.component';




import bindingEffects from '../../../assets/binding.json';
import bindingMod from '../../../assets/binding-mod.json';
import effectsJson from '../../../assets/effects.json';
import tooltipsJson from '../../../assets/tooltips.json';
import propertiesJson from '../../../assets/properties.json';


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
  objectKeys = Object.keys;
  
  code:any


  //variables for layout
  uiDisplayx: any;
  uiDisplayy: any;

  // binding json import
  bindingEffects: any = bindingEffects
  bindingMod: any = bindingMod

  // json with effect list
  effectsMenu: any = effectsJson

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer, public dialog: MatDialog) {
    this.editorForm = this.fb.group({
      uiProperties: this.fb.group({
        width: [{ value: 812, disabled: true}],
        height: [{ value: 375, disabled: true}]
      }, { updateOn: 'blur' }),
      ui: this.fb.array([],{ updateOn: 'submit' }),
      groupEnvelope: this.fb.group({
        attack: [{ value: 0, disabled: false }],
        sustain: [{ value: 1, disabled: false }],
        decay: [{ value: 1, disabled: false }],
        release: [{ value: 0.1, disabled: false }]
      }, { updateOn: 'blur' }),
      groups: this.fb.array([], { updateOn: 'submit' }),
      effects: this.fb.array([],{ updateOn: 'submit' }),
      modulation: this.fb.array([], { updateOn: 'blur' })
    }
    
    );
    this.editorForm.valueChanges
      .subscribe(value => {
        // trigger update value changes
        this.submitForm(value)
      });

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


  sectionElements(key: string | number) {
    return this.editorForm.controls[key] as FormArray;
  }


  setParams(section: string, name: string, value: string, uiIndex: number, max: number, min: number, type?: string) {
    const getControls = this.editorForm.get(section)['controls']
    const binding = getControls[uiIndex].controls.binding

    binding.patchValue({
      'level': (type === 'Group') ? 'group' : 'instrument',
      'parameter': value,
      'type': name.toLowerCase(),
      'minValue': min ? min : 0,
      'maxValue': max ? max : 1
    })


  }

  addElement(key: any,parent: any) {
    let element: any
    
    if (key === 'knob' || key === 'lfo' || key === 'envelope'){
      element = this.fb.group({
        type: key,
        properties: this.getProperties(key),
        binding: this.fb.group({
          type: '',
          level: '',
          position: 0,
          parameter: '',
          translationOutputMin:0,
          translationOutputMax:1
        }, { updateOn: 'blur' })
      })
    } else if (parent === 'effects'){
      const effectProperties = effectsJson.filter(e => e.name === key).map(e => e.properties)[0]
      element = this.fb.group({
        type: key,
        properties: this.fb.group(
          effectProperties
        )
      })
    } else {
      element = this.fb.group({
        type: key,
        properties: this.getProperties(key)
      })
    }
    const array = this.sectionElements(parent);
    array.push(element)
    
  }



  getProperties(key: string) {
    const property = propertiesJson.filter(e => e.key === key).map(e => e.properties)[0]
    let properties: any = this.fb.group(
      property
    )
    

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
  
 
  getInfo(key:any, parent?:any) {
    const info = tooltipsJson
    
    return info[parent || 'controls'][key as keyof typeof info]
  }




  colorKeys(x: any[]) {
    var keys = x.filter((key: { type: string; }) => key.type === 'keyboard')

    Array.from(document.querySelectorAll('.piano-keys i'))
      .forEach(e => e.removeAttribute('style'));

    keys.map((key: { properties: { lowNote: any; highNote: any; color: any; }; }) => {
      let lowNote = key.properties.lowNote
      let highNote = key.properties.highNote
      let color = key.properties.color

      for (let step = lowNote; step <= highNote; step++) {
        document.getElementById('cc-' + step)?.setAttribute('style', 'background-color: #' + color)
      }
    })
  }


  async submitForm(x: any) {
    /* This is the huge responsible of updating everything in the code and keeping the UI in check with every Update
    All events that need to update everytime something changes should be added here */ 

    let formValue = x;

    // updating LFO graph
    if (formValue.modulation.length > 0){
      this.displayWave(formValue.modulation)

    }
    // updating key colors
    if (formValue.ui.length > 0) {
      this.colorKeys(this.editorForm.value.ui)
    }
    
    this.code = ` <?xml version="1.0" encoding="UTF-8"?>
    <DecentSampler minVersion="1.7.2">
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
                          loNote="${element.properties.lowNote}" 
                          hiNote="${element.properties.highNote}" 
                          color="${(element.properties.color.slice(6,8) + element.properties.color.slice(0,6))}" />
                          `
            }
            return el? el: ''
          } ).join('')}
        </keyboard>
      </ui>
      <modulators>
          ${formValue.modulation.map(element =>  {
            let el:any
            if(element.type === 'lfo'){
              el = `<lfo ${Object.entries(element.properties).map(([key, val]) => {
                            return ` ${key}="${val}"`
                          }).join('') }>
         
                          <binding ${Object.entries(element.binding).map(([key, val]) => {
                            return ` ${key}="${val}"`
                          }).join('') }
                          modBehavior="add" 
                          translation="linear" />
                    </lfo>
                          `
            }
            return el? el: ''
          } ).join('')}
          ${formValue.modulation.map(element =>  {
            let el:any
            if(element.type === 'envelope'){
              el = `<envelope 
                          ${Object.entries(element.properties).map(([key, val]) => {
                            return ` ${key}="${val}"`
                          }).join('') }
                          />
                          <binding ${Object.entries(element.binding).map(([key, val]) => {
                            return ` ${key}="${val}"`
                          }).join('') }
                          modBehavior="add" 
                          translation="linear" />
                    </envelope>
                    `
            }
            return el? el: ''
          } ).join('')}
      </modulators>
      <groups>
        <group ${Object.entries(formValue.groupEnvelope).map(([key, val]) => { return ` ${key}="${val}"` }).join('') } >

          ${formValue.groups.map(element => {
            let el: any
            if (element.type === 'sample') {
              el =`<sample ${Object.entries(element.properties).map(([key, val]) => {
                            return ` ${key}="${val}"`
                          }).join('') }/>
          `
            }
            return el ? el : ''
          }).join('')}
        </group>
      </groups>
      <effects>
       ${formValue.effects.map(element => {
         let el: any
         el = `<effect type="${element.type}"
          ${Object.entries(element.properties).map(([key, val]) => {
            return ` ${key}="${val}"`
          }).join('') }
          />
          `
         return el ? el : ''
       }).join('')}
      </effects>
      <midi>

      </midi>
      <!-- Made With DecentSampler Editor -->
    </DecentSampler>
    `
   
    jscolor.install()

  }


  displayPicker() {
    jscolor.install()
  }

  openDialog(module) {
    (module == 'changelog') ? this.dialog.open(ChangelogComponent) :
      (module == 'tutorial') ? this.dialog.open(TutorialComponent) : ''
  }

  fileDownload() {
    document.getElementById('submit')?.click()

    const data:any = document.getElementById('result')?.textContent;
    const blob = new Blob([data], { type: 'application/octet-stream' });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

  

  displayWave(elements) {
    var x = 0;

    elements.map((e, index)=>{


      let f = e.properties.frequency
      let c: any = document.getElementById("mod-" + index); // Grab canvas object

      if (c != null){
        let ctx = c.getContext("2d"); // Define canvas context
        let w = c.width; // Canvas width => Frequency is relative to this
        let h = c.height / 2; // Canvas height over two => Amplitude: Volume

        let waveType = e.properties.shape

        // missing square visualization
        function calcWaveY(x) {
          if (waveType === 'sine') {
            return h - h * Math.sin(x * 2 * Math.PI * (f / w));
          } else if (waveType === 'triangle') {
            return 4 * h / w * Math.abs(((x * f) + (f * (w / f) / 4)) % w - (w / 2));
          } else {
            return null
          }
        }

       


        function drawWave(x) {
          ctx.clearRect(0, 0, w, h * 2);

          //draw x axis
          ctx.beginPath(); // Draw a new path
          ctx.strokeStyle = "#333333"; // Pick a color
          ctx.moveTo(0, h); // Where to start drawing
          ctx.lineTo(w, h); // Where to draw to
          ctx.stroke(); // Draw

          // draw horizontal line of current amplitude - only visible in animated version
          ctx.beginPath(); // Draw a new path
          ctx.moveTo(0, h); // Where to start drawing
          ctx.strokeStyle = "#c0c0c0"; // Pick a color
          for (var i = 0; i < x; i++) { // Loop from left side to current x
            var y = calcWaveY(x); // Calculate y value from x
            ctx.moveTo(i, y); // Where to start drawing
            ctx.lineTo(x, y); // Where to draw to
          }
          ctx.stroke(); // Draw


          // draw area below y
          ctx.beginPath(); // Draw a new path
          ctx.strokeStyle = "#7b85bd"; // Pick a color
          for (var i = 0; i < x; i++) { // Loop from left side to current x
            if (i / 3 == Math.round(i / 3)) { // Draw only one line each 3 pixels
              var y = calcWaveY(i); // Calculate y value from x
              ctx.moveTo(i, h); // Where to start drawing
              ctx.lineTo(i, y); // Where to draw to
            }
          }
          ctx.stroke(); // Draw

          // draw sin curve point to point until x
          ctx.beginPath(); // Draw a new path
          ctx.strokeStyle = "black"; // Pick a color
          for (var i = 0; i < x; i++) { // Loop from left side to current x
            var y = calcWaveY(i); // Calculate y value from x
            ctx.lineTo(i, y); // Where to draw to
          }
          ctx.stroke(); // Draw
        }



        drawWave(w) // fixed version not animated

          // // interval not workin
          // //Start time interval
          // var interval = setInterval(function () {
          //   drawWave(x); // Call draww function every cycle
          //   x++; // Increment x by 1
          //   if (x > w) {
          //     //x = 0; // x cannot be more than canvas with, so back to 0
          //     //clearInterval(interval);
          //   }
          // }, 6); // Loop every 6 milliseconds
      }
      


    })
    
  }


  ngOnInit() : void { 
    //setting values for layout
    this.uiDisplayx = this.editorForm.get('uiProperties.width').value
    this.uiDisplayy = this.editorForm.get('uiProperties.height').value
    
  }

  


}

