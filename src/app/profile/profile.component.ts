import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import {FormsModule} from '@angular/forms';
import { NavbarService } from '../navbar/navbar.service';
import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';
import { User } from '../model/index';
import {Observable} from 'rxjs';
import {} from 'jquery';
import { ToastrService } from 'ngx-toastr';




declare var $: any;

const states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia',
'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: User;
  users: User[] = [];
  check: string;
  public model: any;

  @ViewChild('myForm', {static: true})
  private myForm: NgForm;

  constructor(public nav: NavbarService, private userService: UserService, private alertService: AlertService,
    private toastr: ToastrService) { }

    search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : states.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));

  showNotification() {
    const type = ['', 'info', 'success', 'warning', 'danger'];

   // this.alertService.success('This is a test', false);



   //  $.notify('Hello World');

    const color = Math.floor((Math.random() * 4) + 1);
    const from = 'top';
    const align = 'center';
/*
    $.notify({
        icon: 'notifications',
        message: 'Welcome to <b>Material Dashboard</b> - a beautiful freebie for every web developer.'

    }, {
        type: type[color],
        timer: 4000,
        placement: {
            from: from,
            align: align
        }
    });  */
}

  register(myForm: NgForm) {
    console.log('Registration successful.');
    console.log(myForm.value);
  }

  ngOnInit() {
    this.getProfile();
    this.nav.dashActive = '';
    this.nav.homeActive = '';
    this.nav.profileActive = 'active';
    this.nav.show();
    this.check = 'suck';
  //  console.log( this.profile.firstName);
  }

  setProfile(user: User) {
    this.profile = user;
    const myObjStr = JSON.stringify(user);
    console.log(this.profile.firstName);

  }

  getProfile() {
     const userLogin  = JSON.parse(localStorage.getItem('currentUser')); // a javascript object

     console.log(userLogin.username);

     this.userService.getAll()
     .subscribe(users => {
         this.users = users;
        // this.userDataSource.data = users;

     });

    this.userService.getByLogin(userLogin.username).subscribe(data => { this.setProfile(data)
      console.log(data);
  });

  console.log(this.profile);

  }

  updateProfile() {
        //    let userOperation: Observable<User[]>;
         //  userOperation =
            this.userService.update(this.profile).subscribe(suck => {
              this.profile = suck;
             // this.userDataSource.data = users;
          });

  //  this.alertService.success('Profile Updated', false);
  this.toastr.success('Profile Saved Successful', 'Profile Update', {
      timeOut: 2000,
    });

          }

}
