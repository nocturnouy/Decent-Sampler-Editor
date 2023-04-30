import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CdkDragEnd } from "@angular/cdk/drag-drop";
import { SimpleChange } from '@angular/core';




@Component({
  selector: 'app-editor-form',
  templateUrl: './editor-form.component.html',
  styleUrls: ['./editor-form.component.scss']
})
export class EditorFormComponent implements OnInit {



  Object = Object;
  myForm: FormGroup;





  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      uiProperties: this.fb.group({
        width:812,
        height:375
      }),
      ui: this.fb.array([]),
      groups: this.fb.array([]),
      effects: this.fb.array([])
    }, { updateOn: 'blur' });



    this.myForm.valueChanges.subscribe( x => this.submitForm(x))

  }


  get ui(): FormArray {
    return this.myForm.get('ui') as FormArray;
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
    if (key === 'button') {
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
  }

  checkType(key) {
    return typeof key;
  }
  debugger(){
    debugger
  }
  
  async submitForm(x) {
    let resultCont = document.getElementById('result');
    let formValue = x;
    console.log(x)
    resultCont.textContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <DecentSampler minVersion="1.0.0">
      <ui width="${formValue.uiProperties.width}" height="${formValue.uiProperties.height}" layoutMode="relative" bgMode="top_left">
      <tab name="main"> 
        ${formValue.ui.map(element => {
          const el = `<labeled-knob 
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
        return el
        }).join('')}
      </tab>
      </ui>
      <groups attack="0.000" decay="25" sustain="1.0" release="0.430" volume="-3dB">
        <group>
          <!-- <sample loNote="21" hiNote="21" rootNote="21" path=""
                  length="805888"/> -->
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
  }

  ngOnInit() : void {
   this.submitForm(this.myForm.value)
  }





}
