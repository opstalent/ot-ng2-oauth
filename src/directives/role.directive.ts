import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {AuthService}                                     from '../services/auth.service';

@Directive({selector: '[opHasUserRole]'})
export class UserRoleDirective {

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private authService: AuthService) {}

    @Input() set opHasUserRole(role: string) {
        if (this.authService.hasHierarchicalRole(role)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
