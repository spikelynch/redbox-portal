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
      'link'
    ];

    public token(req, res) {
      sails.log.debug('get token:');

      const username = req.param('username');
      const password = req.param('password');

      const obs = WSGitlabService.token(username, password);

      obs.subscribe(response => {
        this.ajaxOk(req, res, null, response.data);
      }, error => {
        sails.log.error(error);
        sails.log.error(`Failed to get token for user: ${username}`);
        this.ajaxFail(req, res, null, [], true);
      });
    }

    public user(req, res) {
      sails.log.debug('get user:');

      const token = req.param('token');

      sails.log.error('token');
      sails.log.error(token);

      const obs = WSGitlabService.user(token);

      obs.subscribe(response => {
        this.ajaxOk(req, res, null, response.data);
      }, error => {
        sails.log.error(error);
        sails.log.error(`Failed to get info for with token: ${token}`);
        this.ajaxFail(req, res, null, [], true);
      });
    }

    public projects(req, res) {
      sails.log.debug('get projects');

      const token = req.param('token');
      const id = req.param('id');

      sails.log.error('token');
      sails.log.error(token);
      sails.log.error('id');
      sails.log.error(id);

      const obs = WSGitlabService.projects(token, id);

      obs.subscribe(response => {
        this.ajaxOk(req, res, null, response.data);
      }, error => {
        sails.log.error(error);
        sails.log.error(`Failed to get projects for token: ${token} and user: ${id}`);
        this.ajaxFail(req, res, null, [], true);
      });

    }

    public link(req, res) {
      sails.log.debug('get link');

      const token = req.param('token');
      const projectId = req.param('projectId');
      const rdmp = req.param('rdmp');

      const obs = WSGitlabService.link(token, projectId, rdmp);

      obs.subscribe(response => {
        this.ajaxOk(req, res, null, response.data);
      }, error => {
        sails.log.error(error);
        sails.log.error(`Failed to link workspace with ID: ${workspace.id}`);
        this.ajaxFail(req, res, null, [], true);
      });
    }

  }
}

module.exports = new Controllers.WSGitlabController().exports();
