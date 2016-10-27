import {
    Http,
    XHRBackend,
    HttpModule,
    Response,
    ResponseOptions
}                           from '@angular/http';
import {
    fakeAsync,
    tick,
    async,
    inject,
    TestBed
}                           from '@angular/core/testing';

import {
    MockBackend,
    MockConnection
}                           from '@angular/http/testing';

import { OAuthService }     from './oauth.service';
import { HttpService }      from './http.service';

class OAuthServiceMock {}

describe('HttpService', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                HttpService,
                { provide: XHRBackend, useClass: MockBackend },
                { provide: OAuthService, useClass: OAuthServiceMock }
            ]
        });
    }));

    it('can instantiate service when inject service',
          inject([HttpService], (service: HttpService) => {
      expect(service instanceof HttpService).toBe(true);
    }));

  it('can instantiate service with "new"', inject([Http, OAuthService], (http: Http, oAuthService: OAuthService) => {
    expect(http).not.toBeNull('http should be provided');
    let service = new HttpService(oAuthService, http);
    expect(service instanceof HttpService).toBe(true, 'new service should be ok');
  }));

  it('can provide the mockBackend as XHRBackend',
    inject([XHRBackend], (backend: MockBackend) => {
      expect(backend).not.toBeNull('backend should be provided');
  }));

  describe('HttpService methods', () => {
    let service: HttpService;
    let http: Http;

    beforeEach(inject([HttpService, Http], (
      ser: HttpService, httpService: Http) => {
        service = ser;
        http = httpService;
    }));

    it('should return correct value when a request is sent', inject([XHRBackend], fakeAsync((backend: MockBackend) => {
        backend.connections.subscribe((c: MockConnection) => {
            expect(c.request.url).toBe('https://google.com');
            c.mockRespond(new Response(new ResponseOptions({body: 'Whos there?'})));
        });
        service.request('https://google.com').subscribe(data => expect(data.text()).toEqual('Whos there?'));
        tick();
    })));

    it('should return correct error when response is with error', inject([XHRBackend], fakeAsync((backend: MockBackend) => {
        backend.connections.subscribe((c: MockConnection) => {
            expect(c.request.url).toBe('https://google.com');
            c.mockRespond(new Response(new ResponseOptions({status: 401, body: { error: 'invalid_grant'} })));
        });
        service.request('https://google.com').subscribe(data => expect(data.json()).toEqual({ error: 'invalid_grant'}));
        tick();
    })));
  });
});
