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
import {WSService} from './workspace.service';
import {UserSimpleService} from "../../user.service-simple";
import {Role, User, LoginResult, SaveResult} from '../../../shared/user-models';

/**
 * WorkspaceFieldComponent Model
 *
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
  wsService: WSService;
  rdmp: string;
  validToken: boolean;
  name: string;
  user: User;
  userToken: string;
  wsUser: any;
  permission: object;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.usersService = this.getFromInjector(UserSimpleService);
    this.wsService = this.getFromInjector(WSService);
    this.wsUser = {username: '', password: ''};
    this.user = new User();
    this.workspaces = [];
    this.name = options['name'] || '';
    this.columns = options['columns'] || [];
    this.permission = options['permission'] || {};
    const params = (new URL(document.location)).searchParams; //How compatible is this with browsers?
    this.rdmp = params.get('rdmp');

    this.setUserInfo((validToken) => {
      this.validToken = validToken;
      this.workspaces = this.getWorkspaces();
    });
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
        'link': 'https://au-mynotebook.labarchives.com/share/testAPI/MC4wfDM0Mjg4LzAvVHJlZU5vZGUvMzU3MjQ2OTE3OXwwLjA=',
        'status': 'get url of api that discovers the status of the record'
      }
    ]
  }

  onLogin(wsUser: any) {
    console.log(wsUser);
    this.wsService
      .getToken(wsUser.username, wsUser.password)
      .then((response) => {
        this.userToken = response;
        this.validToken = true;
        console.log(response);
      })
  }

  setUserInfo(cb) {
    this.usersService.getInfo().then((user: any) => {
      this.user = user;
      // check with database the userToken
      this.userToken = '123123123';
      //how to check validity of token?
      //maybe after failed list of workspaces change validToken
      let validToken = false;
      if (this.userToken) {
        validToken = false;
        cb(validToken);
      } else {
        cb(validToken);
      }
    });
  }

  getToken() {
    return this.wsService
      .getToken(this.wsUser.username, this.wsUser.password)
      .subscribe(response => {
        console.log(response);

      });
  }

  backToRDMP(){
    console.log('send location back');
  }
}


/**
 * Component to display information from related objects within ReDBox
 *
 *
 */
@Component({
  selector: 'ws-field',
  template: `
  <div>
    <form *ngIf="!field.validToken" #form="ngForm" (ngSubmit)="field.onLogin(field.wsUser)" novalidate>
    <h4>{{ field.permission.step_1 }}</h4>
    <div class="form-group">
      <label>Username</label>
      <input type="text" class="form-control" name="username" [(ngModel)]="field.wsUser.username">
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" class="form-control" name="password" [(ngModel)]="field.wsUser.password">
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
          <p>{{ field.permission.step_2 }}</p>
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
  <button type="button" class="btn btn-default" (click)="field.backToRDMP()"> Back to RDMP </button>
  </div>
`
})
export class WSComponent extends SimpleComponent {
  field: WSField;

}
