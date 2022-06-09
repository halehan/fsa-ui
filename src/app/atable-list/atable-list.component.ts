import { NgModule } from '@angular/core';
import { NgForm } from '@angular/forms';
import {FormsModule} from '@angular/forms';
import { Component, OnInit, ViewChild  } from '@angular/core';
import {Observable} from 'rxjs';
import { UserService } from '../services/user.service';
import { User } from '../model/index';
import { ToastrService } from 'ngx-toastr';
import { NavbarService } from '../navbar/navbar.service';

export class Employee {
  id: number;
  name: string;
  salary: string;
  country: string;
  city: string
}

@Component({
  selector: 'app-atable-list',
  templateUrl: './atable-list.component.html',
  styleUrls: ['./atable-list.component.scss']
})
export class AtableListComponent implements OnInit {


  @ViewChild('myForm', {static: true})
  private myForm: NgForm;

  users: User[] = [];
  selectedUser: User;

  printMyForm() {
    console.log(this.myForm);
  }

  register(myForm: NgForm) {
    console.log('Registration successful.');
    console.log(myForm.value);
  }

  onSelect(user: User): void {
    this.selectedUser = user;
    // this.myForm.controls['firstName'].setValue('DEF');
    // this.myForm.form.controls['firstName'].setValue('ABC');
    // this.myForm.form.controls['firstName'].setValue(user.firstName);


  }

  onSelectDelete(user: User): void {
    this.selectedUser = user;
  }

  constructor(public nav: NavbarService, private userService: UserService, private toastr: ToastrService) { }

  ngOnInit() {
    this.nav.dashActive = '';
    this.nav.homeActive = '';
    this.nav.profileActive = '';
    this.nav.listActive = 'active';
    this.nav.show();
    this.userService.getAll()
    .subscribe(users => {
        this.users = users;
       // this.userDataSource.data = users;

    });
  }

  updateUser() {

    //    let userOperation: Observable<User[]>;

     //  userOperation =
        this.userService.update(this.selectedUser).subscribe(suck => {
          this.selectedUser = suck;
         // this.userDataSource.data = users;

      });

      this.toastr.success('User Update Successful', 'User Update', {
        timeOut: 2000,
      });

      }

}

const EMPLOYEES: Employee[] = [
  { id: 1,  name: 'Dakota Rice', salary: '$45,098', country: 'Niger', city: 'Oud-Turnhout' },
  { id: 2,  name: 'Minerva Hooper', salary: '$25,098', country: 'Curaçao', city: 'Sinaai-Waas' },
  { id: 13, name: 'Sage Rodriguez', salary: '$15,098', country: 'USA', city: 'Altha' },
  { id: 14, name: 'Philip Chaney', salary: '$465,098', country: 'Netherlands', city: 'Baileux' },
  { id: 15, name: 'Doris Greene', salary: '$45,098', country: 'USA', city: 'Altha' },
  { id: 16, name: 'Mason Porter', salary: '$78,615', country: 'Chile', city: 'Gloucester' }
];
