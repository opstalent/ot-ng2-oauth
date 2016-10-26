import {
  ComponentFixture,
  TestBed
}                               from '@angular/core/testing';
import { By }                   from '@angular/platform-browser';
import {
  Component,
  Injectable }                  from '@angular/core';

import { IsLoggedInDirective }  from './IsLoggedIn.directive';
import { AuthService }          from '../services/auth.service';


@Component({
  template: `
  <div *opIsLoggedIn>
    <h1>This is very sensitive information</h1>
  </div>`
})
class TestHasRoleComponent { }

@Injectable()
class AuthServiceMock {
  isLoggedIn() {}
}

describe('IsLoggedIn directive', () => {
  let fixture: ComponentFixture<TestHasRoleComponent>;
  let authService: AuthService;

  afterEach(() => { fixture = null; });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ IsLoggedInDirective, TestHasRoleComponent ],
      providers: [{ provide: AuthService, useClass: AuthServiceMock }]
    });

    fixture = TestBed.createComponent(TestHasRoleComponent);
    authService = fixture.debugElement.injector.get(AuthService);
  });

  it('should hide content if user is not logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(false);
    fixture.detectChanges();
    let content = fixture.debugElement.query(By.css('h1'));

    expect(content).toEqual(null);
  });


  it('should show content if user is logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(true);
    fixture.detectChanges();
    let content = fixture.debugElement.query(By.css('h1'));

    expect(content).not.toEqual(null);
  });

});
