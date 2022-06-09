import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../navbar/navbar.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  constructor(public nav: NavbarService) { }

  ngOnInit() {

    this.nav.dashActive = '';
    this.nav.homeActive = '';
    this.nav.profileActive = '';
    this.nav.reportActive = '';
    this.nav.bidActive = '';
    this.nav.userActive = '';
    this.nav.searchActive = '';
    this.nav.paymentsActive = 'active';
    this.nav.show();
  }

}
