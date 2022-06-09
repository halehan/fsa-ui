import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { Role } from '../model/role';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  model: any = {};
  roles: Role[];
  loading = false;
  error = '';

  constructor(private router: Router,
    private authenticationService: AuthenticationService, private userService: UserService) { }


  logout() {

    this.authenticationService.logout();

  }
  ngOnInit() {

    this.logout();
  }

  login() {

    this.userService.getUserRoles(this.model.username)
      .subscribe(_roles => {
        localStorage.setItem('roles', JSON.stringify(_roles));
        console.log(_roles);

        localStorage.setItem('isAdmin', 'False');
        localStorage.setItem('isUser', 'False');
        localStorage.setItem('isUserAdmin', 'False');
        localStorage.setItem('isAudit', 'False');
        localStorage.setItem('isFine', 'False');

        for (const entry of _roles) {

          if (entry.roleName === 'User') {
            localStorage.setItem('isUser', 'True');
          }

          if (entry.roleName === 'Admin') {
            localStorage.setItem('isAdmin', 'True');
          } 

          if (entry.roleName === 'UserAdmin') {
            localStorage.setItem('isUserAdmin', 'True');
          } 

          if (entry.roleName === 'Audit') {
            localStorage.setItem('isAudit', 'True');
          }

          if (entry.roleName === 'ReadOnly') {
            localStorage.setItem('readOnly', 'True');
          }

          if (entry.roleName === 'Fine') {
            localStorage.setItem('isFine', 'True');
          }

      }

      console.log('isAdmin ' + localStorage.getItem('isAdmin'));
      console.log('isUser ' + localStorage.getItem('isUser'));
      console.log('isAudit ' + localStorage.getItem('isAudit'));
      console.log('isUserAdmin ' +localStorage.getItem('isUserAdmin'));
      console.log('readOnly ' +localStorage.getItem('readOnly'));

      });

    this.loading = true;
    this.authenticationService.login(this.model.username, this.model.password)
      .subscribe(result => {
        if (result === true) {
          this.router.navigate(['/home']);
        } else {
          this.error = 'Username or password is incorrect';
          this.loading = false;
        }
      });

  }
}
