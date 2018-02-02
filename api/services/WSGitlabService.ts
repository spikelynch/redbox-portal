import {Observable, Scheduler} from 'rxjs/Rx';
import services = require('../../typescript/services/CoreService.js');
import {Sails, Model} from "sails";
import * as request from "request-promise";
import Gitlab = require('gitlab');
import axios = require('axios');

declare var sails: Sails;
declare var _this;
declare var Institution: Model;

export module Services {

  export class WSGitlabService extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'token',
      'user',
      'projects'
    ];

    config: any;
    axios: any;

    constructor() {
      super();
      this.config = sails.config.local.workspaces.gitlab;
      this.axios = axios.create({
        baseURL: this.config.host,
        timeout: this.config.timeout,
        headers: {
        }
      });
    }

    token(username: string, password: string) {
      const post = this.axios.post(
        '/oauth/token',
        {grant_type: "password", username: username, password: password}
      );
      return Observable.fromPromise(post);
    }

    user(token: string) {
      const get = this.axios.get(
        `/api/v4/user?access_token=${token}`
      )
      return Observable.fromPromise(get);
    }

    projects(token: string, id: number) {
      sails.log.error(`/api/v4/users/${id}/projects?access_token=${token}`)
      const get = this.axios.get(
        `/api/v4/users/${id}/projects?access_token=${token}`
      );
      return Observable.fromPromise(get);
    }

  }

}
module.exports = new Services.WSGitlabService().exports();
