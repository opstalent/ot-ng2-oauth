import {
  ComponentFixture,
  TestBed
}                               from '@angular/core/testing';
import { By }                   from '@angular/platform-browser';
import {
  Component,
  Injectable }                  from '@angular/core';

import { UserRoleDirective }    from './role.directive';
import { AuthService }          from '../services/auth.service';


@Component({
  template: `
  <div *opHasUserRole="'CHUCK_NORRIS'">
    <h1>This is very sensitive information</h1>
  </div>`
})
class TestRoleComponent { }

@Injectable()
class AuthServiceMock {
  hasHierarchicalRole(role: any) {  }
}

describe('Role directive', () => {
  let fixture: ComponentFixture<TestRoleComponent>;
  let authService: AuthService;

  afterEach(() => { fixture = null; });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRoleDirective, TestRoleComponent ],
      providers: [{ provide: AuthService, useClass: AuthServiceMock }]
    });
    fixture = TestBed.createComponent(TestRoleComponent);
    authService = fixture.debugElement.injector.get(AuthService);
  });

  it('should hide content if user has permissions', () => {
    spyOn(authService, 'hasHierarchicalRole').and.returnValue(false);
    fixture.detectChanges();
    let content = fixture.debugElement.query(By.css('h1'));

    expect(content).toEqual(null);
  });

  it('should show content if user has permissions', () => {
    spyOn(authService, 'hasHierarchicalRole').and.returnValue(true);
    fixture.detectChanges();
    let content = fixture.debugElement.query(By.css('h1'));
    expect(content).not.toEqual(null);
  });
});
