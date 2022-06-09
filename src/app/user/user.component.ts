import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../navbar/navbar.service';
import { User } from '../model/index';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  users: User[] = [];

  constructor(public nav: NavbarService) { }

  ngOnInit() {
    this.nav.show();
  this.nav.dashActive = '';
  this.nav.homeActive = '';
  this.nav.profileActive = '';
  this.nav.listActive = '';
  this.nav.bidActive = '';
  this.nav.userActive = 'active';
  this.nav.reportActive = '';
  this.nav.searchActive = '';
  this.nav.paymentsActive = '';

  }

}
