import {
    NgModule,
    ModuleWithProviders
}                               from '@angular/core';
import {AuthService}            from './services/auth.service';
import {OAuthService}           from './services/oauth.service';
import {UserRoleDirective}      from './directives/role.directive';
import {IsLoggedInDirective}    from './directives/IsLoggedIn.directive';
import {HttpService}            from './services/http.service';
import {CommonModule}           from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        UserRoleDirective,
        IsLoggedInDirective,
    ],
    exports: [
        UserRoleDirective,
        IsLoggedInDirective
    ]
})
export class OAuthModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: OAuthModule,
            providers: [
                AuthService,
                OAuthService,
                HttpService,
            ]
        };
    }
}
