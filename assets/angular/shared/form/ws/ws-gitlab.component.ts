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
  name: string;
  user: User;
  wsUser: WSUser;
  username: string = '';
  password: string = '';
  permissionList: object;
  permissionStep1: string;
  permissionStep2: string;
  permissionRevoke: string;
  backToRDMP: string;
  loginMessageForm: {};
  currentWorkspace: {};
  linkingMessage: any;
  checks: Checks;
  creation: Creation;
  groups: Array<Group> = [];
  templates: Array<Template> = [];
  revokeMessage: string;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.usersService = this.getFromInjector(UserSimpleService);
    this.wsGitlabService = this.getFromInjector(WSGitlabService);
    this.wsUser = new WSUser();
    this.user = new User();
    this.creation = new Creation();
    this.loginMessageForm = {message: '', class: ''};
    this.currentWorkspace = {path_with_namespace: '', web_url:''};
    this.workspaces = [];
    this.name = options['name'] || '';
    this.columns = options['columns'] || [];
    this.permissionList = options['permissionList'] || {};
    this.permissionStep1 = options['permissionStep1'] || '';
    this.permissionStep2 = options['permissionStep2'] || '';
    this.permissionRevoke = options['permissionRevoke'] || '';
    this.backToRDMP = options['backToRDMP'] || 'go back';
    this.revokeMessage = options['revokeMessage'] || '';
    const params = (new URL(document.location)).searchParams; //How compatible is this with browsers?
    this.rdmp = params.get('rdmp');
    this.rdmpLocation = this.wsGitlabService.recordURL + '/' + this.rdmp + '#workspaces';
    this.checks = new Checks();
    this.usersService.getInfo().then((user: any) => {
      this.user = user;
      this.wsUser.set(user);
      if(this.wsUser.token) {
        this.getWorkspacesRelated();
      }
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
    this.wsGitlabService.projects(this.wsUser.token)
    .then(w => this.workspaces = w)
    .catch(e => console.log(e));
  }

  getWorkspacesRelated() {
    this.wsGitlabService.projectsRelatedRecord(this.wsUser.token)
    .then(w => {this.workspaces = w})
    .catch(e => console.log(e));
  }

  // LinkWorkspace will first check links in RDMP and master branch of gitlab projects
  // Then, it will add link if there is not one in it
  linkWorkspace(projectId: number) {
  jQuery('#gitlabLinkModal').modal('show');
  this.currentWorkspace = _.find(this.workspaces, {id: projectId});
  this.wsGitlabService.checkRepo(this.wsUser.token, this.currentWorkspace.path_with_namespace)
  .then(response => {
    if(!response.ws) {
      this.checks.master = true;
      return this.createLink(this.currentWorkspace.id)
      .then(response => {
        this.checks.rdmp = true;
      });
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

createWorkspace() {
  const group1 = {id: this.wsUser.id, path: this.wsUser.username};
  this.groups = [group1];
  const template1 = {pathWithNamespace: undefined};
  const template2 = {pathWithNamespace: 'open-source/template'};
  this.templates = [template1, template2]
  this.wsGitlabService.groups(this.wsUser.token)
  .then(response => {
    this.groups = this.groups.concat(response);
    jQuery('#gitlabCreateModal').modal('show');
  });

}

create() {
  this.creation.message = 'Creating workspace';
  this.creation.creationAlert = 'info';
  console.log(this.creation)
  this.wsGitlabService.createWorkspace(this.wsUser.token, this.creation)
  .then(response => {
    return this.checkCreation();
  }).then(response => {
    this.creation.message = 'Linking workspace';
    this.creation.creationAlert = 'warning';
    return this.createLink(response.id)
    .then(response => {
      this.creation.message = 'Workspace created and linked';
      this.creation.creationAlert = 'success';
    });
  })
  .catch(error => {
    this.creation.creationAlert = 'danger';
    this.creation.message = 'There was a problem creating and linking your workspace';
    console.log(error);
  })
}

checkCreation() {
  let pathWithNamespace = '';
  pathWithNamespace = this.creation.group + '/' + this.creation.name;
  return this.wsGitlabService.project(this.wsUser.token, pathWithNamespace);
}

checkName(){
  //TODO: check workspace name if it is available
}

createLink(projectId: number) {
  return this.wsGitlabService
  .link(this.wsUser.token, this.rdmp, projectId, this.currentWorkspace)
}

onLogin() {
  jQuery('#gitlabPermissionModal').modal('show');
}

allow() {
  jQuery('#gitlabPermissionModal').modal('hide');
  this.wsGitlabService
  .token(this.user, this.username, this.password)
  .then(response => {
    if (response && response.status) {
      return this.usersService.getInfo()
    } else {
      this.loginMessage(response.message, 'danger');
    }
  }).then((user: any) => {
    if(user){
      this.user = user;
      this.wsUser.set(this.user);
      console.log('token: ' + this.wsUser.token);
      return this.wsGitlabService
      .user(this.wsUser.token)
      .then(response => {
        if (response && response.status) {
          console.log('id: ' + response.id);
          this.wsUser.id = response.id;
          this.wsUser.username = response.username;
          this.getWorkspacesRelated();
        } else {
          console.log('error geting user : ' + response.message);
        }
      })
      .catch(error => {
        console.log('error');
        console.log(error);
      });
    } else {
      this.loginMessage('Cannot login', 'danger');
    }
  });
}

loginMessage(message, cssClass) {
  this.loginMessageForm.message = message;
  this.loginMessageForm.class = cssClass;
}

sendToRDMP() {
  console.log('send location back');
  document.location = this.rdmpLocation;
}

revokeModal() {
  jQuery('#gitlabRevokeModal').modal('show');
}

revoke() {
  //delete workspace record here
  this.wsGitlabService
  .revokeToken(this.user)
  .then(response => {
    this.wsUser.token = null;
    jQuery('#gitlabRevokeModal').modal('hide');
  })
  .catch(error => {
    console.log(error);
  });
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
  token: string = null;
  id: number;
  username: string;

  set(user: any) {
    if(user.accessToken && user.accessToken.gitlab) {
      const gitlab = user.accessToken.gitlab;
      this.token = gitlab.accessToken.access_token;
      this.username = gitlab.user.username;
      this.id = gitlab.user.id;
    }
  }
}

class Checks {
  link: any = undefined;
  rdmp: boolean = false;
  linkCreated: boolean = false;
  linkWithOther: boolean = false;
  master: boolean = false;
  comparing: boolean = false;
}

class Group {
  name: string;
  id: string;
}

class Template {
  pathWithNamespace: string;
}

class Creation {
  created: boolean = false;
  name: string;
  namespace: string;
  creationAlert: string;
  blank: boolean = true;
  template: string;
  description: string;
  group: string;
  isGroup: boolean = false;
}
