import {Injectable, Inject} from '@angular/core';
import {BaseService} from "../../base-service";
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/delay';
import {Observable} from 'rxjs/Observable';
import {ConfigService} from "../../config-service";

@Injectable()
export class WSGitlabService extends BaseService {

  protected baseUrl: any;
  public recordURL: string = this.brandingAndPortalUrl + '/record/edit';

  constructor(@Inject(Http) http: Http, @Inject(ConfigService) protected configService: ConfigService) {
    super(http, configService);
  }

  token(user: any, username: string, password: string) {
    //build wsUrl here with server client
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/token';
    return this.http.post(
      wsUrl,
      {user: user, username: username, password: password}, this.options
    )
    .toPromise()
    .then((res: any) => {
      return this.extractData(res);
    })
    .catch((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  revokeToken(user: any){
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/revokeToken';
    return this.http.post(
      wsUrl,
      {user: user}, this.options
    )
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
    return this.http.post(
      wsUrl, {token: token}, this.options
    )
    .toPromise()
    .then((res: any) => {
      return this.extractData(res);
    })
    .catch((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  projects(token: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/projects';
    return this.http.post(
      wsUrl, {token: token}, this.options
    )
    .toPromise()
    .then((res: any) => {
      return this.extractData(res)
    })
    .catch((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  projectsRelatedRecord(token: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/projectsRelatedRecord';
    return this.http.post(
      wsUrl, {token: token}, this.options
    )
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
    return this.http.post(
      wsUrl,
      {token: token, rdmpId: rdmpId, projectId: projectId, workspace: workspace},
      this.options
    )
    .toPromise()
    .then((res: any) => {
      console.log(res);
      return this.extractData(res);
    })
    .catch((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  checkLink(token: string, rdmpId: string, projectNameSpace: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/checkLink';
    return this.http.post(
      wsUrl,
      {token: token, rdmpId: rdmpId, projectNameSpace: projectNameSpace},
      this.options
    )
    .toPromise()
    .then((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  checkRepo(token: string, projectNameSpace: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/checkRepo';
    return this.http.post(
      wsUrl,
      {token: token, projectNameSpace: projectNameSpace},
      this.options
    )
    .toPromise()
    .then((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  compareLink(token: string, projectNameSpace: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/compareLink';
    return this.http.post(
      wsUrl,
      {token: token, projectNameSpace: projectNameSpace},
      this.options
    )
    .toPromise()
    .then((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  createWorkspace(token: string, creation: any) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/create';
    //TODO: check namespace when creation
    return this.http.post(
      wsUrl,
      {token: token, creation: creation},
      this.options
    )
    .toPromise()
    .then((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

  project(token: string, pathWithNamespace: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/gitlab/project';
    //TODO: check namespace when creation
    return this.http.post(
      wsUrl,
      {token: token, pathWithNamespace: pathWithNamespace},
      this.options
    )
    .delay(5000)
    .toPromise()
    .then((res: any) => {
      console.log(res);
      return this.extractData(res);
    });
  }

}