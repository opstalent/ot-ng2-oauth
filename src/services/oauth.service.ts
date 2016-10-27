import { 
    Injectable, 
    Inject 
}                       from '@angular/core';
import { 
    Http, 
    Headers, 
    RequestOptions, 
    Response 
}                       from '@angular/http';
import { Observable }   from 'rxjs/Rx';
import { 
    IAuthConfig, 
    AUTH_CONFIG 
}                       from '../models/opAuthConfig';
import { OAuthToken }   from './token.service';

import { forOwn }       from 'lodash';

/**
 * 
 * 
 * @export
 * @class OAuthService
 */
@Injectable()
export class OAuthService {

    /**
     * 
     * 
     * @protected
     * @type {string}
     * @memberOf OAuthService
     */
    protected clientId: string;
    /**
     * 
     * 
     * @protected
     * @type {string}
     * @memberOf OAuthService
     */
    protected clientSecret: string;
    /**
     * 
     * 
     * @protected
     * @type {string}
     * @memberOf OAuthService
     */
    protected baseUrl: string;
    /**
     * 
     * 
     * @protected
     * @type {string}
     * @memberOf OAuthService
     */
    protected grantPath: string;
    /**
     * 
     * 
     * @protected
     * @type {string}
     * @memberOf OAuthService
     */
    protected revokePath: string;

    /**
     * Creates an instance of OAuthService.
     * 
     * @param {Http} http
     * @param {IAuthConfig} authConfig
     * 
     * @memberOf OAuthService
     */
    constructor(protected http: Http, @Inject(AUTH_CONFIG)private authConfig: IAuthConfig) {
        this.clientId = authConfig.clientId;
        this.clientSecret = authConfig.clientSecret;
        this.baseUrl = authConfig.baseUrl;
        this.grantPath = authConfig.grantPath;
        this.revokePath = authConfig.revokePath;
    }

    /**
     * 
     * 
     * @returns
     * 
     * @memberOf OAuthService
     */
    isAuthenticated() {
        let date = Math.floor(Date.now() / 1000);
        if (OAuthToken.getToken().refresh_token === undefined && OAuthToken.getToken().date < date) {
            this.getClientToken().subscribe();
            return false;
        }
        return !!OAuthToken.getToken();
    }

    /**
     * 
     * 
     * @param {*} [data]
     * @param {*} [options]
     * @returns {Observable<Response>}
     * 
     * @memberOf OAuthService
     */
    getClientToken(data?: any, options?: any): Observable<Response> {
        let search = {
            client_id: this.clientId,
            grant_type: 'client_credentials'
        };

        let request = this.getRequest(search, data, options);

        return this.http.post(`${this.baseUrl}${this.grantPath}`, request.body, request.options)
            .map(res => {
                let token = res.json();
                token.date = Math.floor((Date.now() / 1000) + 3500);
                OAuthToken.setToken(token);
                return token;
            });
    }

    /**
     * 
     * 
     * @param {string} username
     * @param {string} password
     * @param {*} [data]
     * @param {*} [options]
     * @returns {Observable<Response>}
     * 
     * @memberOf OAuthService
     */
    getAccessToken(username: string, password: string, data?: any, options?: any): Observable<Response> {
        let search = {
            client_id: this.clientId,
            grant_type: 'password',
            username: username,
            password: password
        };

        let request = this.getRequest(search, data, options);
        return this.http.post(`${this.baseUrl}${this.grantPath}`, request.body, request.options)
            .map(res => {
                let token = res.json();
                OAuthToken.setToken(token);
                return token;
            });
    }

    /**
     * 
     * 
     * @param {*} [data]
     * @param {*} [options]
     * @returns {Observable<Response>}
     * 
     * @memberOf OAuthService
     */
    getRefreshToken(data?: any, options?: any): Observable<Response> {
        let search = {
            client_id: this.clientId,
            grant_type: 'refresh_token',
            refresh_token: OAuthToken.getRefreshToken()
        };

        let request = this.getRequest(search, data, options);

        return this.http.post(`${this.baseUrl}${this.grantPath}`, request.body, request.options)
            .map(res => {
                let token = res.json();
                OAuthToken.setToken(token);
                return token;
            });
    }
  
    /**
     * 
     * 
     * @param {*} [data]
     * @param {*} [options]
     * @returns {Observable<Response>}
     * 
     * @memberOf OAuthService
     */
    revokeToken(data?: any, options?: any): Observable<Response> {
        let refreshToken = OAuthToken.getRefreshToken();
        let search = {
            client_id: this.clientId,
            token: refreshToken ? refreshToken : OAuthToken.getAccessToken(),
            token_type_hint: refreshToken ? 'refresh_token' : 'access_token'
        };

        let request = this.getRequest(search, data, options);

        return this.http.post(`${this.baseUrl}${this.revokePath}`,
          request.body, request.options)
            .map(res => {
                let token = res.json();
                OAuthToken.removeToken();
                return token;
            });
    }

    /**
     * 
     * 
     * @protected
     * @param {*} body
     * @param {*} [data]
     * @param {*} [optionsData={}]
     * @returns
     * 
     * @memberOf OAuthService
     */
    protected getRequest(body: any, data?: any, optionsData: any = {}) {
        if (this.clientSecret) {
            body.client_secret = this.clientSecret;
        }

        forOwn(data, (value, key) => { body.set(key, value); });

        if (!optionsData.headers) {
            optionsData.headers = new Headers({'Content-Type': 'application/json'});
        }

        return {
            body: JSON.stringify(body),
            options: new RequestOptions(optionsData)
        };
    }
}
