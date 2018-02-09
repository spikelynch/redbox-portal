declare var module;
declare var sails;
import {Observable} from 'rxjs/Rx';

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
      'checkLink'
    ];

    public token(req, res) {
      sails.log.debug('get token:');

      const username = req.param('username');
      const password = req.param('password');

      const obs = WSGitlabService.token(username, password);

      obs.subscribe(response => {
        response.status = true;
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to get token for user: ${username}`;
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
      const id = req.param('id');

      const obs = WSGitlabService.projects(token, id);

      obs.subscribe(response => {
        response.status = true;
        this.ajaxOk(req, res, null, response);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed to get projects for token: ${token} and user: ${id}`;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
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
        return WSGitlabService.addWorkspaceInfo(token, projectId, workspaceId, 'stash.workspace');
      })
      .flatMap(response => {
        // How to drop out error!
        //this.addParentRecordLink(rdmpId, workspaceId);
        sails.log.debug('addParentRecordLink');
        return this.addParentRecordLink(rdmpId, workspaceId)
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

    addParentRecordLink(rdmpId:string, workspaceId: string) {
      sails.log.debug('getRecordMeta');
      return WSGitlabService.getRecordMeta(rdmpId)
      .flatMap(recordMetadata => {
        sails.log.debug('recordMetadata');
        if(recordMetadata && recordMetadata.workspaces) {
          const wss = recordMetadata.workspaces.find(id => workspaceId === id);
          if(!wss) {
            recordMetadata.workspaces.push({id: workspaceId});
          }
        }
        return WSGitlabService.updateRecordMeta(recordMetadata, rdmpId);
      });
    }

    public checkRepo(req, res) {
      sails.log.debug('check link');

      const token = req.param('token');
      const rdmpId = req.param('rdmpId');
      const projectNameSpace = req.param('projectNameSpace');

      sails.log.debug('checkLink:readFileFromRepo');
      let workspaceId = '';

      return WSGitlabService.readFileFromRepo(token, projectNameSpace, 'stash.workspace')
      .subscribe(fileContent => {
        sails.log.debug('checkLink:getRecordMeta');
        workspaceId = Buffer.from(fileContent.content, 'base64').toString('ascii');
        sails.log.debug(workspaceId);
        this.ajaxOk(req, res, null, workspaceId);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed check link workspace project: ${projectNameSpace} : ${JSON.stringify(error)}` ;
        sails.log.error(errorMessage);
        if(error.StatusCodeError === 404 && error.StatusCodeError.match('file not found')){
          this.ajaxOk(req, res, null, '');
        }else {
          this.ajaxFail(req, res, null, errorMessage);
        }
      });
    }

    public checkLink(req, res) {
      sails.log.debug('check link');

      const token = req.param('token');
      const rdmpId = req.param('rdmpId');
      const projectNameSpace = req.param('projectNameSpace');

      sails.log.debug('checkLink:readFileFromRepo');
      let workspaceId = '';

      return WSGitlabService.readFileFromRepo(token, projectNameSpace, 'stash.workspace')
      .flatMap(fileContent => {
        sails.log.debug('checkLink:getRecordMeta');
        workspaceId = Buffer.from(fileContent.content, 'base64').toString('ascii');
        sails.log.debug(workspaceId);
        return WSGitlabService.getRecordMeta(workspaceId);
      })
      .flatMap(response => {
        sails.log.debug('checkLink:getRecordMeta');
        sails.log.debug(projectNameSpace);
        sails.log.debug(response.title);

        let exists = false;
        if(projectNameSpace === response.title){
          exists = true;
          return WSGitlabService.getRecordMeta(rdmpId);
        } else{
          return Observable.of('');
        }
      })
      .subscribe(rdmp => {
        sails.log.debug('checkLink:getRecordMeta 2');
        sails.log.debug(rdmp);
        let exists = [];
        if(rdmp && rdmp.workspaces){
          exists = rdmp.workspaces.find(id => id === workspaceId);
        }
        this.ajaxOk(req, res, null, exists);
      }, error => {
        sails.log.error(error);
        const errorMessage = `Failed check link workspace project: ${projectNameSpace} : ${JSON.stringify(error)}` ;
        sails.log.error(errorMessage);
        this.ajaxFail(req, res, errorMessage);
      });
    }

    getRelatedRecord(rdmp, workspaceId) {
      return
    }

  }
}

module.exports = new Controllers.WSGitlabController().exports();
