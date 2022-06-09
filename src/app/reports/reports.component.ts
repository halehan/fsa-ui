import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../navbar/navbar.service';
import { ContentService } from '../services/content.service';
import { Content } from '../model/index';
import { faSignOutAlt, faTachometerAlt, faHome, faChartPie, faAddressBook, faCoins } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  contents: Content[] = [];

  faSignOutAlt = faSignOutAlt;
  faTachometerAlt = faTachometerAlt;
  faHome = faHome;
  faChartPie = faChartPie;
  faAddressBook = faAddressBook;
  faCoins = faCoins ;

  constructor(private nav: NavbarService,  private contentService: ContentService) { }

  ngOnInit() {
  //  this.nav.show();

    this.contentService.getByName('ReportPage').subscribe(res => {
      this.contents = res;
      console.log(this.contents[0].contentDetail);

  });

  this.nav.dashActive = '';
  this.nav.homeActive = '';
  this.nav.profileActive = '';
  this.nav.listActive = '';
  this.nav.bidActive = '';
  this.nav.userActive = '';
  this.nav.reportActive = 'active';
  this.nav.searchActive = '';
  this.nav.paymentsActive = '';



  }

}
