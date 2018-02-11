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
  username: string = '';
  password: string = '';
  permission: object;
  loginMessageForm: {};
  currentWorkspace: {};
  linkingMessage: any;
  checks: Checks;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.usersService = this.getFromInjector(UserSimpleService);
    this.wsGitlabService = this.getFromInjector(WSGitlabService);
    this.wsUser = new WSUser();
    this.user = new User();
    this.loginMessageForm = {message: '', class: ''};
    this.currentWorkspace = {path_with_namespace: '', web_url:''};
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
    this.checks = new Checks();
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
    return this.wsGitlabService.projects(this.wsUser.token, this.wsUser.id)
    .then(response => {
      this.validToken = true;
      this.workspaces = response;
    })
    .catch(error => {
      console.log('error');
      console.log(error);
    });
  }

  // LinkWorkspace will first check links in RDMP and master branch of gitlab projects
  // Then, it will add link if there is not one in it
  linkWorkspace(projectId: number) {
  jQuery('#gitlabLinkModal').modal('show');
  this.currentWorkspace = _.find(this.workspaces, {id: projectId});
  this.wsGitlabService.checkRepo(this.wsUser.token, this.rdmp)
  .then(response => {
    console.log(response);
    if(!response.ws) {
      this.checks.master = true;
      return this.createLink(this.currentWorkspace.id);
    }else {
      return this.wsGitlabService.compareLink(this.rdmp, this.currentWorkspace.path_with_namespace)
    }
  })
  .then(response => {
    console.log(response);
    this.checks.link = response;
    this.checks.linkCreated = true;
  })
  .catch(error => {
    console.log(error);
  });

}

createLink(projectId: number) {
  this.wsGitlabService
  .link(this.wsUser.token, this.rdmp, projectId, this.currentWorkspace)
  .then(response => {
    this.checks.rdmp = true;
    //   console.log(response);
    //   this.backToRDMP();
  })
  .catch(error => {
    console.log(error);
  })
}

onLogin() {
  jQuery('#gitlabPermissionModal').modal('show');
}

allow() {
  jQuery('#gitlabPermissionModal').modal('hide');
  this.wsGitlabService
  .token(this.username, this.password)
  .then(response => {
    if (response.status) {
      this.wsUser.token = response.access_token;
      console.log('token: ' + this.wsUser.token);
      return this.wsGitlabService
      .user(this.wsUser.token)
      .then(response => {
        if (response.status) {
          console.log('id: ' + response.id);
          this.wsUser.id = response.id;
          return this.getWorkspaces();
        } else {
          console.log('error geting user : ' + response.message);
        }
      })
      .catch(error => {
        console.log('error');
        console.log(error);
      });
    } else {
      this.loginMessage(response.message, 'danger');
    }
  });
}

loginMessage(message, cssClass) {
  this.loginMessageForm.message = message;
  this.loginMessageForm.class = cssClass;
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
}

class Checks {
  link: any = undefined;
  rdmp: boolean = false;
  linkCreated: boolean = false;
  linkWithOther: boolean = false;
  master: boolean = false;
  comparing: boolean = false;
}
