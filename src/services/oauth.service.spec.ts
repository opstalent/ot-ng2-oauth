import {
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
    HttpModule
}                           from '@angular/http';

import { OAuthService }     from './oauth.service';
import { AUTH_CONFIG }      from '../models/opAuthConfig';

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

describe('OAuthService', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                OAuthService,
                { provide: XHRBackend, useClass: MockBackend },
                { provide: AUTH_CONFIG, useValue: AuthConfigMock }
            ]
        });
    }));

    it('can instantiate service when inject service', () => {
        inject([OAuthService], (service: OAuthService) => {
            expect(service instanceof OAuthService).toBe(true);
        });
    });

    it('can instantiate service with "new"', () => {
        inject([OAuthService], (service: OAuthService) => {
            expect(service instanceof OAuthService).toBe(true, 'new service should be ok');
        });
    });

    it('can provide the mockBackend as XHRBackend',
        inject([XHRBackend], (backend: MockBackend) => {
            expect(backend).not.toBeNull('backend should be provided');
        })
    );

    describe('OAuthService', () => {

        let service: OAuthService;

        beforeEach(inject([OAuthService], (ser: OAuthService) => {
            service = ser;
        }));

        it('should have expected access token', async(inject([], () => {
            service.getClientToken().subscribe(
                (data: Response) => expect(data).toBeTruthy()
            );
        })));

        it('should have expected client token', async(inject([], () => {
            let username = 'superadmin@zoom.it';
            let password = 'Test2016!';

            service.getAccessToken(username, password).subscribe(
                (data: Response) => expect(data).toBeTruthy()
            );
        })));

        it('should not have expected client token', async(inject([], () => {
            let username = 'email@email.com';
            let password = 'Test2016!';

            service.getAccessToken(username, password).subscribe(
                data => {},
                error => {
                    expect(error.status).toEqual(400);
                }
            );
        })));

        it('should have refresh token', async(inject([], () => {
            service.getRefreshToken().subscribe(
                (data: Response) => {
                    expect(data).toBeTruthy();
                }
            );
        })));
    });
});
