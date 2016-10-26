import { Directive, TemplateRef, OnInit, ViewContainerRef } from '@angular/core';
import {AuthService} from '../services/auth.service';

@Directive({ selector: '[opIsLoggedIn]' })
export class IsLoggedInDirective implements OnInit {

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private authService: AuthService
    ) {}

    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
