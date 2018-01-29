// Copyright (c) 2017 Queensland Cyber Infrastructure Foundation (http://www.qcif.edu.au/)
//
// GNU GENERAL PUBLIC LICENSE
//    Version 2, June 1991
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
import {Input, Component, OnInit, Inject, Injector} from '@angular/core';
import {SimpleComponent} from '../field-simple.component';
import {FieldBase} from '../field-base';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import * as _ from "lodash-lib";
import {RecordsService} from '../records.service';
import {UserSimpleService} from "../../user.service-simple";


/**
 * Contributor Model
 *
 *
 * @author <a target='_' href='https://github.com/shilob'>Shilo Banihit</a>
 *
 */
export class WSField extends FieldBase<any> {

  showHeader: boolean;
  validators: any;
  enabledValidators: boolean;
  hasInit: boolean;

  workspaces: object[];
  columns: object[];
  usersService: UserSimpleService;
  rdmp: string;
  validToken: boolean;
  name: string;
  user: object;
  permission: object;

  constructor(options: any, injector: any) {
    super(options, injector);
    const params = (new URL(document.location)).searchParams;
    this.rdmp = params.get('rdmp');

    this.user = {username: null, password: null};

    this.workspaces = [];
    this.name = options['name'] || '';
    this.columns = options['columns'] || [];
    this.permission = options['permission'] || {};

    this.validToken = true;
    //this.usersService = this.getFromInjector(UserSimpleService);
    this.workspaces = this.getWorkspaces();

  }


  createFormModel(valueElem: any = undefined): any {
    if (valueElem) {
      this.value = valueElem;
    }
    this.formModel = new FormControl(this.value || []);
    if (this.value) {
      this.setValue(this.value);
    }
    return this.formModel;
  }

  setValue(value: any) {
    this.formModel.patchValue(value, {emitEvent: false});
    this.formModel.markAsTouched();
  }

  setEmptyValue() {
    this.value = [];
    return this.value;
  }

  getWorkspaces() {
    return [
      {
        'project': 'project1',
        'link': 'https://git.research.uts.edu.au/135553/project1',
        'status': 'get url of api that discovers the status of the record'
      }
    ]
  }

  onLogin(f: any) {
    console.log(f);


  }

}


/**
 * Component to display information from related objects within ReDBox
 *
 *
 */
@Component({
  selector: 'ws-login-field',
  template: `
  <div>
    <form #form="ngForm" (ngSubmit)="field.onLogin(this)" novalidate>
    <div class="form-group">
      <label>Username</label>
      <input type="text" class="form-control" name="username" [(ngModel)]="field.user.username">
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" class="form-control" name="password" [(ngModel)]="field.user.password">
    </div>
    <button class="btn btn-primary" type="submit">Login</button>
  </form>
  <div class="modal fade">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Requesting Permission</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ field.permission.label }}</p>
          <ul>
            <li *ngFor="let permission of field.permission.list">{{ permission }}</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">Allow</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
  <div *ngIf="field.validToken" class='padding-bottom-10'>
    <div class="row">
      <table class="table">
        <thead>
            <tr>
                <ng-container *ngFor="let header of field.columns"><th>{{ header.label }}</th></ng-container>
            </tr>
        </thead>
        <tbody>
        <tr *ngFor="let item of field.workspaces"><ng-container *ngFor="let column of field.columns"><td  *ngIf='column.show != false'>
          <span *ngIf='column.link != null; else noProcessing '><a href="/{{ branding }}/{{ portal }}/{{ column.link.pattern}}"></a></span>
          <ng-template #multivalue></ng-template>
          <ng-template #noProcessing><span >{{ item[column.property] }}</span></ng-template>
        </td></ng-container></tr>
        </tbody>
      </table>
    </div>
  </div>
  </div>
`
})
export class WSComponent extends SimpleComponent {
  field: WSField;

}
