import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CdkDragEnd } from "@angular/cdk/drag-drop";




@Component({
  selector: 'app-editor-form',
  templateUrl: './editor-form.component.html',
  styleUrls: ['./editor-form.component.scss']
})
export class EditorFormComponent implements OnInit {

  checkType = function (obj) {
    return typeof obj;
  };

  Object = Object;
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    //console.log(this.dsForm);
    this.myForm = this.fb.group({
      ui: this.fb.array([]),
      groups: this.fb.array([]),
      effects: this.fb.array([])
    }, { updateOn: 'blur' });



    //this.myForm.valueChanges.subscribe( x => this.submitForm(x))
    //this.myForm.valueChanges.subscribe(x => console.log(x))

  }


  get ui(): FormArray {
    return this.myForm.get('ui') as FormArray;
  }

  get lessons() {
    //const form = this.myForm;
    
    return this.myForm.controls["ui"] as FormArray;
  }


  getPropertyList(key, parent) {
    console.log(this.myForm.controls[parent].value[key].properties)
    return this.myForm.controls[parent].value[key].properties as FormArray;
  }
  sectionElements(key) {
    return this.myForm.controls[key] as FormArray;
  }

  addElement(key,parent) {
    let element: any;
    if (key === 'button'){
      element = this.fb.group({
        type: key,
        properties: this.fb.group(
          {
            btnX: 0,
            btnY: 0,
            btnText: 'text'
          }
        )
      });
    } else if (key === 'slider'){
      element = this.fb.group({
        type: key,
        properties: this.fb.group(
          {
            sliderX: 0,
            sliderY: 0
          }
        )
      });
    }
    
    const array = this.sectionElements(parent);
    //this.lessons.push(element);
    array.push(element)
    
  }


  deleteLesson(lessonIndex: number, parent) {
    this.sectionElements(parent).removeAt(lessonIndex);
  }



  
   async submitForm(x) {
     let resultCont = document.getElementById('result');
     let formValue = x;
     console.log(formValue)
     resultCont.textContent = JSON.stringify(formValue)
     //  resultCont.textContent = `
     //  <?xml version="1.0" encoding="UTF-8"?>
     //  <DecentSampler minVersion="1.0.0">
    
     //  </DecentSampler>
     //  `
   }

  ngOnInit() : void {
   this.submitForm(this.myForm.value)
   console.log('init')
  }


  dragEnd($event: CdkDragEnd) {
    const element = this.ui.controls[$event.source.element.nativeElement.id].controls.properties
    const position = $event.source.getFreeDragPosition()
    element.controls.btnX.setValue(Math.round(position.x + $event.source.element.nativeElement.offsetLeft))
    element.controls.btnY.setValue(Math.round(position.y + $event.source.element.nativeElement.offsetTop))


    
  }


}
