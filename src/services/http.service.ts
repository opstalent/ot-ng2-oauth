import { Injectable }   from '@angular/core';
import {
    Headers,
    Http,
    Request,
    RequestOptions,
    RequestOptionsArgs,
    Response
}                       from '@angular/http';
import { OAuthService } from './oauth.service';
import { OAuthToken }   from './token.service';
import { 
    Observable, 
    Subject 
}                       from 'rxjs/Rx';

@Injectable()
export class HttpService {

    constructor(private oauth: OAuthService, private http: Http) {}

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(url, options);
    }

    /**
     * @param {string} url
     * @param {RequestOptionsArgs} [options]
     * @returns {Observable<Response>}
     *
     * @memberOf HttpService
     */
    get(url: string, options: RequestOptionsArgs = new RequestOptions()): Observable<Response> {
        options.method = 'GET';
        return this.intercept(url, options);
    }

    /**
     * @param {string} url
     * @param {string} body
     * @param {RequestOptionsArgs} [options]
     * @returns {Observable<Response>}
     *
     * @memberOf HttpService
     */
    post(url: string,
        body: string,
        options: RequestOptionsArgs = new RequestOptions()): Observable<Response> {
        options.method = 'POST';
        options.body = body;
        options = this.setAuthorizationHeader(this.getRequestOptionArgs(options));
        return this.intercept(url, options);
    }

    /**
     * @param {string} url
     * @param {string} body
     * @param {RequestOptionsArgs} [options]
     * @returns {Observable<Response>}
     *
     * @memberOf HttpService
     */
    put(url: string, body: string, options: RequestOptionsArgs = new RequestOptions()): Observable<Response> {
        options.method = 'PUT';
        options.body = body;
        options = this.setAuthorizationHeader(this.getRequestOptionArgs(options));
        return this.intercept(url, options);
    }

    /**
     *
     * @param {string} url
     * @param {string} body
     * @param {RequestOptionsArgs} [options]
     * @returns {Observable<Response>}
     *
     * @memberOf HttpService
     */
    patch(url: string, body: string, options: RequestOptionsArgs = new RequestOptions()): Observable<Response> {
        options.method = 'PATCH';
        options.body = body;
        return this.intercept(url, options);
    }

    /**
     * @param {string} url
     * @param {RequestOptionsArgs} [options]
     * @returns {Observable<Response>}
     *
     * @memberOf HttpService
     */
    delete(url: string, options: RequestOptionsArgs = new RequestOptions()): Observable<Response> {
        options.method = 'DELETE';
        return this.intercept(url, options);
    }

    protected setAuthorizationHeader(options: RequestOptionsArgs = new RequestOptions): RequestOptionsArgs {
        if (options.headers == null) {
            options.headers = new Headers();
        }
        if (!options.headers.has('Authorization')) {
            let authHeader = OAuthToken.getAuthorizationHeader();
            if (authHeader) {
                options.headers.append('Authorization', OAuthToken.getAuthorizationHeader());
            }
        }
        return options;
    }

    protected getRequestOptionArgs(options: RequestOptionsArgs = new RequestOptions): RequestOptionsArgs {
        if (options.headers == null) {
            options.headers = new Headers();
        }
        options.headers.append('Content-Type', 'application/json');
        return options;
    }

    protected intercept(url: string | Request, options: RequestOptionsArgs = new RequestOptions): Observable<Response> {
        return Observable.create((observer: any) => {
            if (options.headers && options.headers.has('Authorization')) {
                options.headers.delete('Authorization');
            }
            options = this.setAuthorizationHeader(options);
            this.http.request(url, options).subscribe(
                (result: any) => observer.next(result),
                (error: any) => observer.error(error));
        }).retryWhen((errors: any) => this.errorHandler(errors, options));
    }

    protected errorHandler(errors: any, options?: RequestOptionsArgs): any {
        return errors.switchMap((err: any) => {
            if (err.status !== 401 && err.status !== 400) {
                return Observable.throw(err.json());
            }
            let data = err.json();
            if (400 === err.status
                && ['invalid_request', 'invalid_grant'].indexOf(data.error) !== -1) {
                OAuthToken.removeToken();
                return Observable.throw(err.json());
            }
            let hasBearerToken = err.headers.has('www-authenticate') && 0 === err.headers.get('www-authenticate').indexOf('Bearer');
            if (401 === err.status && ['invalid_token', 'invalid_grant'].indexOf(data.error) !== -1 || hasBearerToken) {
                let closedSubject = new Subject();
                this.oauth.getRefreshToken().subscribe(
                    (res: Response) => closedSubject.next(res),
                    (error: any) => Observable.throw(error.json())
                );
                return <any>closedSubject;
            }
            return Observable.throw(err.json());
        });
    }
}
