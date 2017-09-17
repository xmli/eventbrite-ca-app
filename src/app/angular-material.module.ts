import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//NgMaterial Modules
import { MdTableModule,  } from '@angular/material';

@NgModule({
  imports: [MdTableModule, ],
  exports: [MdTableModule, ],
})
export class AngularMaterialModule { }