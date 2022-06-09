import { Component, OnInit } from '@angular/core';
import { NavbarService } from './navbar.service';
import { faSignOutAlt, faTachometerAlt, faHome, faChartPie, faAddressBook, faCoins } from '@fortawesome/free-solid-svg-icons';
import {HttpModule } from '@angular/http';
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';
import {NgIdleModule} from '@ng-idle/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Constants } from '../constants';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

 // appTitle = ' FSA Cooperative Purchasing Program Reporting';
  appTitle = Constants.APP_TITLE;
  appVersion = Constants.APP_VERSION;
  buildDate =  Constants.APP_BUILD_DATE;
  testingActive = '';
  homeActive = '';
  dashActive = '';
  profileActive = '';
  bidActive = '';
  reportActive = '';
  userActive = '';
  listActive = '';
  searchActive = '';
  paymentsActive = '';
  chartsActive = '';
  vis: boolean;
  styleCls = '';
  headingColor = 'white';
  headingSize = '1';

  faSignOutAlt = faSignOutAlt;
  faTachometerAlt = faTachometerAlt;
  faHome = faHome;
  faChartPie = faChartPie;
  faAddressBook = faAddressBook;
  faCoins = faCoins ;

  idleState = 'Not started.';
  timedOut = false;
  showContinue: boolean;
  isAdmin: boolean;
  isAudit: boolean;
  isUserAdmin: boolean;
  isUser: boolean;
  isReadOnly;
  isFine: boolean;

  constructor(private router: Router, private idle: Idle, private authenticationService: AuthenticationService,
    public nav: NavbarService ) {

      if (!environment.production) {
        this.appTitle = this.appTitle + ' --BETA-- ';
        this.headingColor = '#f8b93a';
      }

      this.junk();

  }
  
  isHidePurchaseorder() {
    return !(this.isUser || this.isReadOnly) ;
  }

  isHidePaymentProcessing() {
    return !(this.isUser || this.isReadOnly) ;
  }

  isHideVendorFines() {
    return !this.isFine
  }
  

  isHideTableMaintenance() {
    return !this.isAdmin;
  }

  isHideUserMaintenance() {
    return !this.isUserAdmin;
  }

  isHideSearchPayments() {
    return !this.isAudit;
  }

  isProd () {
    return (environment.production);
  }



  checkState ()  { return (this.idleState === 'Started');  }

  junk() {

     // sets an idle timeout of 5400 seconds or 90 minutes, for testing purposes.
     this.idle.setIdle(Constants.IDLE_TIMEOUT);
     // sets a timeout period of 300 seconds or 5 minutes. after 95 minutes of inactivity, the user will be considered timed out.
     this.idle.setTimeout(Constants.COUNTDOWN_TIMEOUT);
     // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
     this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

     this.idle.onIdleEnd.subscribe(() => this.idleState = 'No longer idle.');
     this.idle.onTimeout.subscribe(() => {
     this.idleState = 'Timed out!';
     this.timedOut = true;
     this.authenticationService.logout();
     this.router.navigate(['/login']);

     });
     this.idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
     this.idle.onTimeoutWarning.subscribe((countdown) => this.idleState = 'You will time out in ' + countdown + ' seconds!');

     // sets the ping interval to 15 seconds
    // keepalive.interval(15);

    // keepalive.onPing.subscribe(() => this.lastPing = new Date());

     this.reset();

  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started';
    this.timedOut = false;
    this.showContinue = false;
  }


  ngOnInit() {
    this.vis = this.nav.getVisible();
    this.styleCls = ((this.nav.getVisible()) ? '' : 'hiden');

    this.testingActive = this.nav.getTestingActive();
    this.homeActive = this.nav.getHomeActive();
    this.homeActive = this.nav.getHomeActive();
    this.dashActive = this.nav.getDashActive();
    this.profileActive = this.nav.getProfileActive();
    this.bidActive = this.nav.getBidActive();
    this.reportActive = this.nav.getReportActive();
    this.userActive = this.nav.getUserActive();
    this.searchActive = this.nav.getSearchActive();
    this.paymentsActive = this.nav.getPaymentsActive();
    this.chartsActive = this.nav.getChartsActive();

    console.log(localStorage.getItem('isAdmin'));
    this.isAdmin = (localStorage.getItem('isAdmin') == 'True');
    this.isAudit = (localStorage.getItem('isAudit') == 'True');
    this.isUser = (localStorage.getItem('isUser') == 'True');
    this.isUserAdmin = (localStorage.getItem('isUserAdmin') == 'True');
    this.isReadOnly = (localStorage.getItem('readOnly') == 'True');
    this.isFine = (localStorage.getItem('isFine') == 'True');

    console.log('isAdmin ' + localStorage.getItem('isAdmin'));
    console.log('isUser ' + localStorage.getItem('isUser'));
    console.log('isAudit ' + localStorage.getItem('isAudit'));
    console.log('isUser ' +localStorage.getItem('isUserAdmin'));

  }

  logout() {
    this.nav.logout();
  }

}
