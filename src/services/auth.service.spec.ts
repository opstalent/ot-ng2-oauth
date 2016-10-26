import {
    fakeAsync,
    tick,
    async,
    inject,
    TestBed
}                           from '@angular/core/testing';

import {
    MockBackend
}                           from '@angular/http/testing';

import {
    XHRBackend,
    Response,
    ResponseOptions,
    HttpModule
}                           from '@angular/http';
import { Router }           from '@angular/router';
import { OAuthService }     from './oauth.service';
import { AuthService }      from './auth.service';
import { HttpService }      from './http.service';
import { OAuthUser }        from './user.service';
import { AUTH_CONFIG }     from '../models/opAuthConfig';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';

const AuthConfigMock = {
  clientId: '1',
  clientSecret: '2',
  baseUrl: 'games.com',
  frontUrl: 'google.com',
  grantPath: '/oauth/v2/token',
  revokePath: '/oauth/v2/revoke',
  googleMapsApiKey: 'A3'
};

const userRolesMock = {
  'CHUCK_NORRIS_ROLE': {
    'COBRA_ROLE': true,
    'UNIVERSE_ROLE': true,
    'RULER_ROLE': false
  }
};

class RouterStub {
  navigate(commands: any[]) { }
}

describe('AuthService', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                AuthService,
                OAuthService,
                HttpService,
                OAuthUser,
                { provide: Router, useClass: RouterStub },
                { provide: XHRBackend, useClass: MockBackend },
                { provide: AUTH_CONFIG, useValue: AuthConfigMock },
                { provide: 'userRoles', useValue: userRolesMock }
            ]
        });
    }));

    it('can instantiate service when inject service',
          inject([AuthService], (service: AuthService) => {
      expect(service instanceof AuthService).toBe(true);
    }));

  it('can instantiate service with "new"',
            inject([HttpService, Router, OAuthService],
            (http: HttpService, router: Router, oAuthService: OAuthService,
            oAuthUser: OAuthUser) => {
    expect(http).not.toBeNull('http should be provided');
    let service = new AuthService(http, router,
      oAuthService, AuthConfigMock, oAuthUser, userRolesMock );
    expect(service instanceof AuthService).toBe(true, 'new service should be ok');
  }));

  it('can provide the mockBackend as XHRBackend',
    inject([XHRBackend], (backend: MockBackend) => {
      expect(backend).not.toBeNull('backend should be provided');
  }));

  describe('Auth Service', () => {
    let service: AuthService;
    let user: OAuthUser;
    let router: Router;

    beforeEach(inject([AuthService, OAuthUser, Router], (
      ser: AuthService,
      userService: OAuthUser,
      routerService: Router) => {
        service = ser;
        user = userService;
        router = routerService;
    }));

    it('should return true if user has role', () => {
      spyOn(user, 'getUser').and.returnValue({ roles: ['CHUCK_NORRIS_ROLE']});
      let hasRole = service.hasRole('CHUCK_NORRIS_ROLE');
      expect(hasRole).toBeTruthy();
    });

    it('should return false if there is no user', () => {
      spyOn(user, 'getUser').and.returnValue(null);
      let hasRole = service.hasRole('CHUCK_NORRIS_ROLE');
      expect(hasRole).toBeFalsy();
    });

    it('should return false if user has no role', () => {
      spyOn(user, 'getUser').and.returnValue({ roles: ['CHUCK_NORRIS_ROLE']});
      let hasRole = service.hasRole('WUNDERKIND_ROLE');
      expect(hasRole).toBeFalsy();
    });

    it('should redirect to home on login if user is not an admin', inject([XHRBackend], fakeAsync((backend: MockBackend) => {
      spyOn(user, 'getUser').and.returnValue({ roles: ['CHUCK_NORRIS_ROLE']});
      spyOn(router, 'navigate').and.returnValue(true);
      backend.connections.subscribe((connection: any) => {
        let response = new ResponseOptions({body: JSON.stringify({})});
        connection.mockRespond(new Response(response));
      });
      service.login();
      tick();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    })));

    it('should redirect to dashboard on login if user is admin', inject([XHRBackend], fakeAsync((backend: MockBackend) => {
      spyOn(user, 'getUser').and.returnValue({
        roles: ['ROLE_COMPANY_ADMIN', 'ROLE_SUPER_ADMIN']});
      spyOn(router, 'navigate').and.returnValue(true);
      backend.connections.subscribe((connection: any) => {
        let response = new ResponseOptions({body: JSON.stringify({})});
        connection.mockRespond(new Response(response));
      });
      service.login();
      tick();
      expect(router.navigate).toHaveBeenCalledWith(['dashboard']);
    })));
  });

});
