import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
import { UserService } from '../../services/user.service';
import { User, Role } from '../../model/index';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss']
})
export class UserlistComponent implements OnInit, AfterViewInit {

  displayedColumns = ['firstName', 'lastName', 'phone', 'loginId', 'createdTime', 'edit', 'delete'];
  userDataSource = new MatTableDataSource();
  users: User[] = [];
  roles: Role[] = [];

  selectedUser: User;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private userService: UserService, private toastr: ToastrService) { }

  ngAfterViewInit() {
    this.userDataSource.sort = this.sort;
  }

  isEmpty(val: String): boolean {

    if ((val === undefined || val === null || val.length === 0)) {
      return true;
    } else {
      return false;
    }

  }

  onSelect(user: User): void {
    this.selectedUser = user;

  /*  
    this.selectedUser.user = false
    this.selectedUser.admin = false
    this.selectedUser.userAdmin = false
    this.selectedUser.audit = false
    this.selectedUser.readOnly = false;
   */


   this.userService.getUserRoles(user.loginId)
      .subscribe(_roles => {
        this.roles = _roles;
        console.log(this.roles);

      for (let entry of _roles) {

        if (entry.roleName === 'User') {
          this.selectedUser.user = true
        }

        if (entry.roleName === 'Admin') {
          this.selectedUser.admin = true
        }

        if (entry.roleName === 'UserAdmin') {
          this.selectedUser.userAdmin = true
        }

        if (entry.roleName === 'Audit') {
          this.selectedUser.audit = true
        }

        if (entry.roleName === 'ReadOnly') {
          this.selectedUser.readOnly = true
        }

        if (entry.roleName === 'Fine') {
          this.selectedUser.fine = true
        }

      } 

    });   

  }

 async refresh()  {

    this.userService.getAll()
      .subscribe(val => {
        this.users = val;
        this.userDataSource.data = val;
      });

     if( this.selectedUser ) {

      this.userService.getUserRoles(this.selectedUser.loginId)
      .subscribe(_roles => {
        this.roles = _roles;
        console.log(this.roles);

      for (let entry of _roles) {

        if (entry.roleName === 'User') {
          this.selectedUser.user = true
        }

        if (entry.roleName === 'Admin') {
          this.selectedUser.admin = true
        }

        if (entry.roleName === 'UserAdmin') {
          this.selectedUser.userAdmin = true
        }

        if (entry.roleName === 'Audit') {
          this.selectedUser.audit = true
        }

        if (entry.roleName === 'ReadOnly') {
          this.selectedUser.readOnly = true
        }

      } 

    });   
  }


  }

   ngOnInit() {
    this.refresh();
  }

  applyUserFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.userDataSource.filter = filterValue;
  }

  delete(user: User): void {

    if (confirm('Are you sure you want to delete User?  ' + user.loginId)) {

      this.userService.deleteUser(user.id).subscribe(po => {
      });

      this.toastr.success('User delete Successful', 'User Delete', {
        timeOut: 2000,
      });


    }

    this.refresh();

  }

  updateUser() {

    if (this.selectedUser.user) {
      this.selectedUser.readOnly = false
    }

    this.userService.update(this.selectedUser).subscribe(async user => {
    //  this.selectedUser = user;
 
     await this.refresh();
     await this.initRoles();
    });

    this.toastr.success('User Saved Successful', 'User Update', {
      timeOut: 2000,
    });


  }

  async initRoles() {

    this.userService.getUserRoles(this.selectedUser.loginId)
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

  }


}