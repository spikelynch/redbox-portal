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
import {WSGitlabService} from './ws-gitlab.service';
import {UserSimpleService} from "../../user.service-simple";
import {Role, User, LoginResult, SaveResult} from '../../../shared/user-models';

declare var jQuery: any;
/**
* WorkspaceFieldComponent Model
*
*
*/
export class WSGitlabField extends FieldBase<any> {

  showHeader: boolean;
  validators: any;
  enabledValidators: boolean;
  hasInit: boolean;

  workspaces: object[];
  columns: object[];
  usersService: UserSimpleService;
  wsGitlabService: WSGitlabService;
  rdmp: string;
  rdmpLocation: string;
  validToken: boolean;
  name: string;
  user: User;
  wsUser: WSUser;
  username: string;
  password: string;
  permission: object;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.usersService = this.getFromInjector(UserSimpleService);
    this.wsGitlabService = this.getFromInjector(WSGitlabService);
    this.username = 'xxx'; this.password = 'xxxx';
    this.wsUser = new WSUser();
    this.user = new User();
    this.workspaces = [];
    this.name = options['name'] || '';
    this.columns = options['columns'] || [];
    this.permission = options['permission'] || {};
    const params = (new URL(document.location)).searchParams; //How compatible is this with browsers?
    this.rdmp = params.get('rdmp');
    this.rdmpLocation = this.wsGitlabService.recordURL + '/' + this.rdmp + '#workspaces';
    this.setUserInfo((validToken) => {
      this.validToken = validToken;
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

  getWorkspaces(id: number) {
    this.workspaces  = [
      {
        "id": 8,
        "description": "",
        "name": "my-test-project",
        "name_with_namespace": "135553 / my-test-project",
        "path": "my-test-project",
        "path_with_namespace": "135553/my-test-project",
        "created_at": "2018-02-01T17:08:42.451+11:00",
        "default_branch": null,
        "tag_list": [],
        "ssh_url_to_repo": "git@git-test.research.uts.edu.au:135553/my-test-project.git",
        "http_url_to_repo": "https://git-test.research.uts.edu.au/135553/my-test-project.git",
        "web_url": "https://git-test.research.uts.edu.au/135553/my-test-project",
      }
    ]
    // if(!this.wsUser.id || !this.wsUser.token){
    //   alert('no id or token');
    // } else {
    //     return this.wsGitlabService.projects(this.wsUser.token, this.wsUser.id)
    //     .then(response => {
    //       this.workspaces = response;
    //       console.log(this.workspaces)
    //     })
    //     .catch(error => {
    //       console.log('error');
    //       console.log(error);
    //     });
    //   }
    this.validToken = true;
  }

  linkWorkspace(id: number) {
    const workspace = _.find(this.workspaces, {id: id});
    //this will link the workspace you have selected,
    //that is create workspace in redbox
    //then add link information in gitlab
    jQuery('#gitlabLinkModal').modal('show');
    this.wsGitlabService.link(this.wsUser.token, this.wsUser.id, workspace)
    .then(response => {
      console.log(response);
      this.backToRDMP();
    });
  }

  onLogin() {
    jQuery('#gitlabPermissionModal').modal('show');
  }

  allow(){
    jQuery('#gitlabPermissionModal').modal('hide');
    this.wsGitlabService
    .token(this.username, this.password)
    .then(response => {
      this.wsUser.setToken(response.access_token);
      return this.wsGitlabService
      .user(this.wsUser.token)
      .then(response => {
        this.wsUser.setId(response.id);
        return this.getWorkspaces(response.id);
      })
      .catch(error => {
        console.log('error');
        console.log(error);
      });
    });
  }

  setUserInfo(cb) {
    this.usersService.getInfo().then((user: any) => {
      this.user = user;
      // check with database the userToken
      this.wsUser.token = '123123123';
      //how to check validity of token?
      //maybe after failed list of workspaces change validToken
      let validToken = false;
      if (this.wsUser.token) {
        validToken = false;
        cb(validToken);
      } else {
        cb(validToken);
      }
    });
  }


  backToRDMP() {
    console.log('send location back');
    document.location = this.rdmpLocation;
  }

  revokeModal() {
    jQuery('#gitlabRevokeModal').modal('show');
  }

  revoke() {
    //delete workspace record here
    this.validToken = false;
    this.wsUser.token = null;
    jQuery('#gitlabRevokeModal').modal('hide');
  }
}

declare var aotMode;
// Setting the template url to a constant rather than directly in the component as the latter breaks document generation
let rbWSGitlabTemplate = './ws/ws-gitlab.template.html';
if(typeof aotMode == 'undefined') {
  rbWSGitlabTemplate = '../../angular/shared/form/ws/ws-gitlab.template.html';
}
/**
* Component to display information from related objects within ReDBox
*
*
*/
@Component({
  selector: 'ws-field',
  templateUrl: rbWSGitlabTemplate
})
export class WSGitlabComponent extends SimpleComponent {
  field: WSGitlabField;

}

class WSUser {
  token: string;
  id: number;

  setId(id: number) {
    this.id = id;
  }
  setToken(token: string) {
    this.token = token
  }
}
