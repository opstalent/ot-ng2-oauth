import { Injectable, Inject }     from '@angular/core';
import {Router}         from '@angular/router';
import { Observable }   from 'rxjs/Rx';
import { IAuthConfig, AUTH_CONFIG } from '../models/opAuthConfig';
import {OAuthUser}      from './user.service';
import {OAuthToken}     from './token.service';
import {HttpService}    from './http.service';
import {OAuthService}   from './oauth.service';
import { isEmpty, head } from 'lodash';

const USER_ROLES = 'userRoles';

@Injectable()
export class AuthService {
    protected baseUrl: string;
    public redirectUrl: string = 'dashboard';

    constructor(
        protected http: HttpService,
        protected router: Router,
        private oAuth: OAuthService,
        @Inject(AUTH_CONFIG)private authConfig: IAuthConfig,
        private oAuthUser: OAuthUser,
        @Inject(USER_ROLES)private userRoles: Object,
    ) {
      this.baseUrl = authConfig.baseUrl;
    }

    /**
     * Verifies if the `user` is logged in or not
     */
    isLoggedIn() {
        return !!this.oAuthUser.getUser();
    }

    /**
     * Verifies if the `user` has role
     */
    hasRole(role: any) {
        let user = this.oAuthUser.getUser();
        if (user && !isEmpty(user.roles)) {
            return user.roles.indexOf(role) > -1;
        }
        return false;
    }

    hasHierarchicalRole(role: any) {
        let user = this.oAuthUser.getUser();
        if (!isEmpty(user.roles)) {
            let userRole: any = head(user.roles);
            return this.userRoles[userRole][role];
        }
        return false;
    }

    login() {

        this.getLoggedUser().subscribe(val => {
            let redirectUrl = this.redirectUrl;
            if (!this.hasRole('ROLE_COMPANY_ADMIN')
              && !this.hasRole('ROLE_SUPER_ADMIN')) {
                redirectUrl = '/';
            }
            this.router.navigate([redirectUrl]);

        });
    }

    logout() {
        this.oAuthUser.removeUser();
        OAuthToken.removeToken();
        if (!this.oAuth.isAuthenticated()) {
            this.oAuth.getClientToken().subscribe(() => {
                this.router.navigate(['']);
            });
        }
    }

    getLoggedUser(data?: any, options?: any): Observable<any> {
        return this.http.get(`${this.baseUrl}/users/me`)
            .map(res => {
                let user = res.json();
                this.oAuthUser.setUser(user);
                return res;
            });
    }

    forgotPassword(username: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/resetting/send-email`,
          JSON.stringify({ username }))
          .map(res => res.json());
    }

    verify(resetToken: any, password: any): Observable<any> {
        let data = {
            fos_user_resetting_form: {
                plainPassword: {
                    first: password,
                    second: password
                }
            }
        };

        return this.http.post(`${this.baseUrl}/resetting/reset/${resetToken}`,
          JSON.stringify(data))
          .map(res => res.json());
    }
}
