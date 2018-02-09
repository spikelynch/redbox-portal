import {Injectable, Inject} from '@angular/core';
import {BaseService} from "../../base-service";
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Observable} from 'rxjs/Observable';
import {ConfigService} from "../../config-service";

@Injectable()
export class WSGitlabService extends BaseService {

  protected baseUrl: any;
  public recordURL: string = this.brandingAndPortalUrl + '/record/edit';

  constructor(@Inject(Http) http: Http, @Inject(ConfigService) protected configService: ConfigService) {
    super(http, configService);
  }

  token(username: string, password: string) {
    //build wsUrl here with server client
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/token';
    return this.http
    .post(wsUrl,
      {username: username, password: password},
      this.options)
    .toPromise()
    .then((res: any) => {
      return this.extractData(res);
    })
    .catch((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  user(token: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/user';
    return this.http
    .post(wsUrl,
      {token: token},
      this.options)
    .toPromise()
    .then((res: any) => {
      return this.extractData(res);
    })
    .catch((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  projects(token: string, id: number) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/projects';
    return this.http
    .post(wsUrl,
      {token: token, id: id},
      this.options)
    .toPromise()
    .then((res: any) => {
      return this.extractData(res)
    })
    .catch((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  link(token: string, rdmpId: string, projectId: number, workspace: any) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/link';
    return this.http
    .post(wsUrl,
      {token: token, rdmpId: rdmpId, projectId: projectId, workspace: workspace},
      this.options)
      .toPromise()
      .then((res: any) => {
        console.log(res);
        return this.extractData(res);
      });
    }

    checkLink(token: string, rdmpId: string, projectNameSpace: string) {
      const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/checkLink';
      return this.http
      .post(wsUrl,
        {token: token, rdmpId: rdmpId, projectNameSpace: projectNameSpace},
        this.options)
        .toPromise()
        .then((res: any) => {
          console.log(res);
          return this.extractData(res);
        });
      }

  }
