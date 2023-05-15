import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CdkDragEnd } from "@angular/cdk/drag-drop";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatAccordion } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';

import { ChangelogComponent } from '../changelog/changelog.component';



import bindingEffects from '../../../assets/binding.json';
import bindingMod from '../../../assets/binding-mod.json';
import effectsJson from '../../../assets/effects.json';
import { TutorialComponent } from '../tutorial/tutorial.component';


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

//put this into a separate json and import it
  bindingEffects: any = bindingEffects
  bindingMod: any = bindingMod

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
      modulation: this.fb.array([],{ updateOn: 'submit' })
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

    
    if (key === 'knob' || key === 'lfo'){
      element = this.fb.group({
        type: key,
        properties: this.getProperties(key),
        binding: this.fb.group({
          type: '',
          level: '',
          position: 0,
          parameter: '',
          minValue:0,
          maxValue:1
        }, { updateOn: 'submit' })
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
    } else if (key === 'keyboard') {
      properties = this.fb.group({
        lowNote: 0,
        highNote: 11,
        color: 'FF0000FF'
      })
    } else if (key === 'sample') {
      properties = this.fb.group({
        loNote: 'C0',
        hiNote:'C6',
        rootNote:'C3',
        path: "samples/C4.wav",
        loopStart:0,
        loopEnd:100000
      })
    } else if (key === 'lfo') {
      properties = this.fb.group({
        shape: 'sine',
        frequency: 0.3,
        scope: 'global',
        modAmount: 1
      })
    } else if (key === 'envelope') {
      properties = this.fb.group({
        attack:0,
        decay:0,
        sustain:1,
        release:0,
        modAmount:1,
        scope:'global'
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
  getInfo(key:any, parent?:any) {
    const info = {
      controls: {
        uiWidth: 'This element is disabled for now',
        uiHeight: 'This element is disabled for now',
        lowNote: 'starter note to apply color, must be a CC number (0 to 127)',
        highNote: 'end note to apply color, must be a CC number (0 to 127)',
        level: 'The amount of gain to be applied expressed as a linear number. In other words, gain of 0.5 reduces sound by 50% (this is equivalent to -6dB). A value of 2.0 doubles the volume of the sound (equivalent to +6dB) -range: 0 - 8.0, where 1.0 is no change.'
      },
      groups: {
        loNote: 'can be a cc number or a note name (ex: C3 or 60)',
        hiNote: 'can be a cc number or a note name (ex: C3 or 60)',
        rootNote: 'can be a cc number or a note name (ex: C3 or 60)',
        path: 'the relative path to the sample',
        loopStart: 'The frame/sample position of the start of the sample’s loop. If this is not specified, but the sample is a wave file with embedded loop markers, those will be used instead. Default: 0',
        loopEnd: 'The frame/sample position of the end of the sample’s loop. If this is not specified, but the sample is a wave file with embedded loop markers, those will be used instead. Default: the file’s length in samples minus 1.'
      },
      effects: {
        filter: 'A 2-pole resonance filter that can be either a lowpass, bandpass, or highpass filter',
        gain: 'Applies a volume boost or cut to the output signal.',
        reverb:'',
        delay:'',
        chorus:'',
        phaser:'',
        convolution:'This effect allows you to use a convolution reverb or amp simulation to your sample library. Depending on the length of the impulse response, the convolution effect can use substantial CPU.',
        wave_folder: 'Introduced in version 1.7.2. This effect allows you to fold a waveform back on itself. This is very useful for generating additional harmonic content.',
        wave_shaper: 'Introduced in version 1.7.2. This effect allows you to distort an audio signal. This is very useful for generating additional harmonic content.'


      }
      
      
      
    }
    
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
    document.getElementById('submit').click()
    
    let formValue = x;
    this.colorKeys(this.editorForm.value.ui)
    
    this.code = ` <?xml version="1.0" encoding="UTF-8"?>
    <DecentSampler minVersion="1.0.0">
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
              el = `<lfo 
                          ${Object.entries(element.properties).map(([key, val]) => {
                            return ` ${key}="${val}"`
                          }).join('') }>
         
                          <binding type="amp" level="group" position="0" parameter="AMP_VOLUME" modBehavior="add" translation="linear" translationOutputMin="0" translationOutputMax="4.0"  />
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
                          <binding type="amp" level="group" position="0" parameter="AMP_VOLUME" modBehavior="add" translation="linear" translationOutputMin="0" translationOutputMax="4.0"  />
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
              el = `<sample 
                          ${Object.entries(element.properties).map(([key, val]) => {
                            return ` ${key}="${val}"`
                          }).join('') }
      
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

  
  ngOnInit() : void { 
    //setting values for layout
    this.uiDisplayx = this.editorForm.get('uiProperties.width').value
    this.uiDisplayy = this.editorForm.get('uiProperties.height').value
    
  }

  


}

