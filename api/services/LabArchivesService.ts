import {Observable, Scheduler} from 'rxjs/Rx';
import services = require('../../typescript/services/CoreService.js');
import {Sails, Model} from "sails";
import * as request from "request-promise";
import la = require('@uts-eresearch/provision-labarchives');

declare var sails: Sails;
declare var _this;
declare var Institution: Model;

export module Services {

  export class LabArchives extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'getToken'
    ];

    getToken(username: string, password: string) {
      return la.accessInfo(sails.config.local.workspaces.la.key, username, password);
    }
  }
}
module.exports = new Services.LabArchives().exports();
