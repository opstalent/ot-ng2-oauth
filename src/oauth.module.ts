import {
    NgModule,
    ModuleWithProviders
}                                   from '@angular/core';
import { CommonModule }             from '@angular/common';
import { OAuthService }             from './services/oauth.service';
import { HttpService }              from './services/http.service';

@NgModule({
    imports: [
        CommonModule,
    ]
})
export class OAuthModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: OAuthModule,
            providers: [
                OAuthService,
                HttpService,
            ]
        };
    }
}
