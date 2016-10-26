import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { OAuthToken } from './token.service';
import { Observable } from 'rxjs/Rx';
import { IAuthConfig, AUTH_CONFIG } from '../models/opAuthConfig';

import { forOwn } from 'lodash';

@Injectable()
export class OAuthService {
    protected clientId: string;
    protected clientSecret: string;
    protected baseUrl: string;
    protected grantPath: string;
    protected revokePath: string;

    constructor(
        protected http: Http, 
        @Inject(AUTH_CONFIG)private authConfig: IAuthConfig
    ) {
        this.clientId = authConfig.clientId;
        this.clientSecret = authConfig.clientSecret;
        this.baseUrl = authConfig.baseUrl;
        this.grantPath = authConfig.grantPath;
        this.revokePath = authConfig.revokePath;
    }

    /**
     * Verifies if the `user` is authenticated or not based on the `token`
     * @return {Boolean}
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
     * Retrieves the `access_token` and stores the `response.data`
     * using the `OAuthToken`.
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
     * Retrieves the `access_token` and stores the `response.data`
     * using the `OAuthToken`.
     */
    getAccessToken(username: string,
      password: string,
      data?: any,
      options?: any): Observable<Response> {
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
     * Retrieves the `refresh_token` and stores the `response.data`
     * using the `OAuthToken`.
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
     * Revokes the `token` and removes the stored `token`
     * using the `OAuthToken`.
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
