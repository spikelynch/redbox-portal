import {Injectable, Inject} from '@angular/core';
import {BaseService} from "../../base-service";
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Observable} from 'rxjs/Observable';
import {ConfigService} from "../../config-service";

@Injectable()
export class WSService extends BaseService {

  protected baseUrl: any;

  constructor(@Inject(Http) http: Http, @Inject(ConfigService) protected configService: ConfigService) {
    super(http, configService);
  }

  getToken(username: string, password: string) {
    //build wsUrl here with server client
    const wsUrl = this.brandingAndPortalUrl + '/ws/la/token';
    console.log(wsUrl);
    return this.http
      .post(wsUrl, {username: username, password: password}, this.options)
      .toPromise();
  }
}
