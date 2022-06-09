import { Component, OnInit} from '@angular/core';

import { User } from '../model/index';
import { Message } from '../model/index';
import { Content } from '../model/index';
import { UserService } from '../services/user.service';
import { ContentService } from '../services/content.service';
import { NavbarService } from '../navbar/navbar.service';

import {HttpModule } from '@angular/http';
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {NgIdleModule} from '@ng-idle/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { Constants } from '../constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  users: User[] = [];
  messages: Message[] = [];
  contents: Content[] = [];

  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;

  appTitle = Constants.APP_TITLE;
  appVersion = Constants.APP_VERSION;
  buildDate =  Constants.APP_BUILD_DATE;

  constructor(private authenticationService: AuthenticationService,
    public nav: NavbarService,  private contentService: ContentService, private userService: UserService ) {

  }


  ngOnInit() {
    this.nav.dashActive = '';
    this.nav.homeActive = 'active';
    this.nav.profileActive = '';
    this.nav.reportActive = '';
    this.nav.bidActive = '';
    this.nav.userActive = '';
    this.nav.searchActive = '';
    this.nav.paymentsActive = '';
    this.nav.show();

    this.contentService.getByName('HomePage').subscribe(res => {
      this.contents = res;
    //  console.log(res);

  });

  }

}
