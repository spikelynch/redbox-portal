declare var module;
declare var sails;
import {Observable} from 'rxjs/Rx';

declare var LabArchivesService;
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
  export class Workspace extends controller.Controllers.Core.Controller {
    /**
     * Exported methods, accessible from internet.
     */
    protected _exportedMethods: any = [
      'getToken'
    ];


    public getToken(req, res) {
      sails.log.debug("getToken:");
      const username = req.param("username");
      const password = req.param("password");
      LabArchivesService.getToken(username, password).then((data) => {
        sails.log.debug(data);
        this.ajaxOk(req, res, null, data);
      }).catch((error) => {
        sails.log.error(`Failed to get access Info for user: ${username}`);
        sails.log.error(error);
        this.ajaxFail(req, res, null, [], true);
      });
    }

  }
}

module.exports = new Controllers.Workspace().exports();
