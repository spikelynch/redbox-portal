declare var module;
declare var sails, Model;
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
const url = require('url');

declare var WSGitlabService;
/**
* Package that contains all Controllers.
*/
import controller = require('../../../typescript/controllers/CoreController.js');

export module Controllers {

  /**
  * Workspace related features....
  *
  *
  */
  export class WSGitlabController extends controller.Controllers.Core.Controller {
    /**
    * Exported methods, accessible from internet.
    */
    protected _exportedMethods: any = [
      'token',
      'user',
      'projects',
      'link',
      'checkRepo',
      'revokeToken',
      'create',
      'project',
      'projectsRelatedRecord'
    ];

    public token(req, res) {
      sails.log.debug('get token:');

      const username = req.param('username');
      const password = req.param('password');
      const user = req.param('user');

      const obs = WSGitlabService.token(username, password);

      obs.flatMap(response => {
        sails.log.debug('token');
        return WSGitlabService.updateUser(user, response, username);
      })
      .subscribe(response => {
        sails.log.debug('updateUser');
        sails.log.debug(response);
        this.ajaxOk(req, res, null, {status: true});
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to get token for user: ${username}`;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    public revokeToken(req, res) {
      sails.log.debug('revokeToken');
      const user = req.param('user');

      return WSGitlabService.revokeToken(user)
      .subscribe(response => {
        sails.log.debug('updateUser');
        sails.log.debug(response);
        this.ajaxOk(req, res, null, {status: true});
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to get token for user: ${user.username}`;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    public user(req, res) {
      sails.log.debug('get user:');

      const token = req.param('token');

      sails.log.error('token');
      sails.log.error(token);

      const obs = WSGitlabService.user(token);

      obs.subscribe(response => {
        response.status = true;
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to get info for with token: ${token}`;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    public projects(req, res) {
      sails.log.debug('get projects');

      const token = req.param('token');
      WSGitlabService.projects(token)
      .subscribe(response => {
        response.status = true;
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to get projects for token: ${token}`;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    public projectsRelatedRecord(req, res) {
      sails.log.debug('get related projects');

      const token = req.param('token');
      let currentProjects = [];
      let projectsWithInfo = [];

      WSGitlabService.projects(token)
      .flatMap(response => {
        let obs = [];
        currentProjects = response.slice(0);
        for (let r of currentProjects) {
          obs.push(WSGitlabService.readFileFromRepo(token, r.path_with_namespace, 'stash.workspace'));
        }
        return Observable.merge(...obs);
      })
      .subscribe(response => {
        const parsedResponse = this.parseResponseFromRepo(response);
        projectsWithInfo.push({
          path: parsedResponse.path,
          info: parsedResponse.content ? this.workspaceInfoFromRepo(parsedResponse.content) : {}
        });
      }, error => {
        const errorMessage = `Failed to get projectsRelatedRecord for token: ${token}`;
        sails.log.debug(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      }, () => {
        sails.log.debug('complete');
        currentProjects.map(p => {
          p.rdmp = projectsWithInfo.find(pwi => pwi.path === p.path_with_namespace);
        });
        this.ajaxOk(req, res, null, currentProjects);
      });
    }



    public link(req, res) {
      sails.log.debug('get link');

      const token = req.param('token');
      const projectId = req.param('projectId');
      const workspace = req.param('workspace');
      const rdmpId = req.param('rdmpId');

      let workspaceId = null;

      sails.log.debug('createWorkspaceRecord')
      WSGitlabService
      .createWorkspaceRecord(workspace, 'draft')
      .flatMap(response => {
        workspaceId = response.oid;
        sails.log.debug('addWorkspaceInfo');
        return WSGitlabService.addWorkspaceInfo(token, projectId, rdmpId + '.' + workspaceId, 'stash.workspace');
      })
      .flatMap(response => {
        sails.log.debug('addParentRecordLink');
        return WSGitlabService.getRecordMeta(rdmpId)
      })
      .flatMap(recordMetadata => {
        sails.log.debug('recordMetadata');
        if(recordMetadata && recordMetadata.workspaces) {
          const wss = recordMetadata.workspaces.find(id => workspaceId === id);
          if(!wss) {
            recordMetadata.workspaces.push({id: workspaceId});
          }
        }
        return WSGitlabService.updateRecordMeta(recordMetadata, rdmpId);
      })
      .subscribe(response => {
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to link workspace with ID: ${projectId} : ${JSON.stringify(error)}` ;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    public checkRepo(req, res) {
      sails.log.debug('check link');

      const token = req.param('token');
      const projectNameSpace = req.param('projectNameSpace');

      return WSGitlabService.readFileFromRepo(token, projectNameSpace, 'stash.workspace')
      .subscribe(response => {
        sails.log.debug('checkLink:getRecordMeta');
        const parsedResponse = this.parseResponseFromRepo(response);
        const wI = parsedResponse.content ? this.workspaceInfoFromRepo(parsedResponse.content) : {rdmp: null, workspace: null};
        sails.log.debug(wI);
        this.ajaxOk(req, res, null, wI);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed check link workspace project: ${projectNameSpace} : ${JSON.stringify(error)}` ;
        sails.log.error(error.message);
        this.ajaxFail(req, res, null, errorMessage);
      });
    }

    public compareLink(req, res) {
      const rdmpId = req.param('rdmpId');
      const projectNameSpace = req.param('projectNameSpace');
      const workspaceId = req.param('workspaceId');

      return WSGitlabService.getRecordMeta(rdmpId)
      .subscribe(recordMetadata => {
        sails.log.debug('recordMetadata');
        if(recordMetadata && recordMetadata.workspaces) {
          const wss = recordMetadata.workspaces.find(id => workspaceId === id);
          let message = 'workspace match';
          if(!wss) {
            message = 'workspace not found';
          }
          this.ajaxOk(req, res, null, {workspace: wss, message: message});
        } else{
          const errorMessage = `Failed compare link workspace project: ${projectNameSpace}` ;
          this.ajaxFail(req, res, null, errorMessage);
        }
      }, error => {
        const errorMessage = `Failed compare link workspace project: ${projectNameSpace} : ${JSON.stringify(error)}` ;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, null, errorMessage);
      });
    }

    public create(req, res) {
      const token = req.param('token');
      const creation = req.param('creation');

      let workspaceId = '';
      const namespace = creation.group + '/' + creation.name;

      return WSGitlabService
      .create(token, creation)
      .subscribe(response => {
        sails.log.debug('updateRecordMeta');
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to create workspace with: ${namespace} : ${JSON.stringify(error)}` ;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    public project(req, res) {
      const token = req.param('token');
      const pathWithNamespace = req.param('pathWithNamespace');

      return WSGitlabService
      .project(token, pathWithNamespace)
      .subscribe(response => {
        sails.log.debug('project');
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to check project with: ${pathWithNamespace} : ${JSON.stringify(error)}` ;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    workspaceInfoFromRepo(content: string) {
      const workspaceLink = Buffer.from(content, 'base64').toString('ascii');
      if(workspaceLink) {
        const workspaceInfo = workspaceLink.split('.');
        return {rdmp: _.first(workspaceInfo), workspace: _.last(workspaceInfo)};
      } else{
        return {rdmp: null, workspace: null};
      }
    }

    parseResponseFromRepo(response) {
      const result = {content: null, path:''};
      if(response.body && response.body.content) {
        result.content = response.body.content;
        var url_parts = url.parse(response.request.uri.href, true);
        var query = url_parts.query;
        result.path = query.namespace;
      } else {
        result.content = null;
        result.path = response.path;
      }
      return result;
    }

  }
}

module.exports = new Controllers.WSGitlabController().exports();