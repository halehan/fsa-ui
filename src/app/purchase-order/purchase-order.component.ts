import { Component, OnInit, ViewChild} from '@angular/core';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import {  BidNumber } from '../model/index';
import { NavbarService } from '../navbar/navbar.service';
import {  PurchaseOrderListComponent } from '../purchase-order-list/purchase-order-list.component';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss']
})
export class PurchaseOrderComponent implements OnInit {

  bids: BidNumber[] = [];
  bidId:  string;
  @ViewChild(PurchaseOrderListComponent, {static: true}) PurchaseOrderListComponent: PurchaseOrderListComponent;
  shareData() {
      this.PurchaseOrderListComponent.sendData(this.bidId);
  }

  constructor(private nav: NavbarService, private poService: PurchaseOrderService,
              private route: ActivatedRoute,   private _router: Router) { }

  refreshPoDetailHandler() {
    console.log('Fired.  How to fire PO Details ?')
        }

  ngOnInit() {

  this.nav.dashActive = '';
  this.nav.homeActive = '';
  this.nav.profileActive = '';
  this.nav.listActive = '';
  this.nav.bidActive = 'active';
  this.nav.userActive = '';
  this.nav.reportActive = '';
  this.nav.searchActive = '';
  this.nav.paymentsActive = '';

    if (this.bids.length === 0) {
      console.log('Bid length if' + this.bids.length);
      console.log('Bid length = 0');
      this.poService.getBids()
          .subscribe(bids => {
          this.bids = bids;
      });

    } else {
      console.log('Bid length else' + this.bids.length);
      console.log('Bid length was <> 0');
    }


    this.bidId = this.route.snapshot.params['bidId'];
    this.PurchaseOrderListComponent.sendData(this.bidId);

    // observable way
    this.route.paramMap.subscribe(params => {

      console.log(params.get('bidId'));
      this.bidId = params.get('bidId');
      this.paramsChange(this.bidId );
  });

  }

  paramsChange(id) {

  }

}
