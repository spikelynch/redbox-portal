import {Observable, Scheduler} from 'rxjs/Rx';
import services = require('../../typescript/services/CoreService.js');
import {Sails, Model} from "sails";
import * as request from "request-promise";
import Gitlab = require('gitlab');
import axios = require('axios');

declare var RecordsService, BrandingService;
declare var sails: Sails;
declare var _this;
declare var Institution: Model;

export module Services {

  export class WSGitlabService extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'token',
      'user',
      'projects',
      'link'
    ];

    config: any;
    axios: any;
    recordType: string;
    formName: string;

    constructor() {
      super();
      this.config = sails.config.local.workspaces.gitlab;
      this.axios = axios.create({
        baseURL: this.config.host,
        timeout: this.config.timeout,
        headers: {
        }
      });
      this.recordType = 'workspace';
      this.formName = 'workspace';
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
      sails.log.debug(`/api/v4/users/${id}/projects?access_token=${token}`)
      const get = this.axios.get(
        `/api/v4/users/${id}/projects?access_token=${token}`
      );
      return Observable.fromPromise(get);
    }

    link(token: string, projectId: number, workspace: any, rdmp: string) {
      //TODO: maybe this needs to change to the current brand?
      const brand = BrandingService.getDefault();
      const record = workspace;
      var obs = RecordsService.create(brand, record, this.recordType, this.formName);
      return obs.subscribe(result => {
        sails.log.debug(result);
        return this.addWorkspaceInfo(token, projectId, result.oid);
      });
    }

    addWorkspaceInfo(token: string, projectId: number, workspaceId: string) {
      const filePath = 'stash/workspace.info'
      const post = this.axios.post(
        `/api/v4/projects/${projectId}/repository/files/${filePath}?access_token=${token}`,
        {
          branch: 'master',
          content: workspaceId,
          author_name: BrandingService.getDefault(),
          commit_message: 'Provisioner'//TODO: define message via config file or form?
        }
      );
      return Observable.fromPromise(post);
    }

    addParentRecordLink(rdmp: string, workspace: string) {

    }

  }

}
module.exports = new Services.WSGitlabService().exports();
