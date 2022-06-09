import { Component, Input, ViewChild, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import {
  PurchaseOrder, Dealer, CityAgency, BidType, Payment, BidNumber,
  ItemBidTypeCode, PoStatusType, Specification, AgencyType
} from '../model/index';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { SearchService } from '../services/search.service';
import { ToastrService } from 'ngx-toastr';
import { DateFormatPipe } from '../dateFormat/date-format-pipe.pipe';
import * as momenttz from 'moment-timezone';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { ItemPaymentComponent } from '../item-payment/item-payment.component';
import { ItemListComponent } from '../item-list/item-list.component';
import { NavbarService } from '../navbar/navbar.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { isEmpty } from 'rxjs-compat/operator/isEmpty';

@Component({
  selector: 'app-search-by-check',
  templateUrl: './search-by-check.component.html',
  styleUrls: ['./search-by-check.component.scss']
})
export class SearchByCheckComponent implements OnInit, AfterViewInit {

  displayedColumns = ['bidNumber', 'poNumber',  'cityAgency', 'dealerName', 
    'itemType', 'checkNumber', 'paymentDate', 'paymentAmount'];

  displayColsGrouping = ['paymentCheckNum', 'dealerName', 'paymentDate', 'POS', 'AdminFee', 'View', 'Delete', 'status'];

  lockedColumns = ['paymentCheckNum', 'dealerName', 'poNumber', 'adminFeeDue', 'paymentAmount', 'paymentDate', 'lockDate'];

  verifyColumns = ['paymentCheckNum', 'dealerName', 'poNumber', 'adminFeeDue', 'paymentAmount', 'paymentDate', 'verifyDate'];

  lockedList = ['createdBy', 'lockedRows', 'lockStartDate', 'lockEndDate', 'createdDate', 'view', 'delete'];

  poDataSource = new MatTableDataSource();
  poPaymentList = new MatTableDataSource();
  lockedPaymentsList = new MatTableDataSource();
  verifyPaymentsList = new MatTableDataSource();
  poLockedList = new MatTableDataSource();
  purchaseOrders: PurchaseOrder[] = [];

  selectedPO: PurchaseOrder;
  selectedPoId: number;

  enableLockedList: boolean;
  enablePoList: boolean;
  enablePoDetail: boolean;
  enableItemList: boolean;
  checkNumberForm: FormGroup;
  lockForm: FormGroup;
  verifyForm: FormGroup;
  searching: boolean;
  lockingByDate: boolean;
  verifyByDate: boolean;
  panelOpenState: boolean;
  enableLockList: boolean;
  enableVerifyList: boolean;
  noRowsMsg: string;
  isAdmin: boolean;

  @ViewChild('lockSort', {static: true}) lockSort: MatSort;
  @ViewChild('verifySort', {static: true}) verifySort: MatSort;
  @ViewChild('paymentSort', {static: true}) paymentSort: MatSort;
  @ViewChild('paymentListSort', {static: true}) paymentListSort: MatSort;
 
 
  @ViewChild('paymentListPaginator' , {static: true, read:MatPaginator}) paymentListPaginator: MatPaginator;
  @ViewChild('paymentPaginator',     {static: true, read: MatPaginator}) paymentPaginator: MatPaginator;
  @ViewChild('lockPaginator',      {static: true, read: MatPaginator}) lockPaginator: MatPaginator;
  @ViewChild('verifyPaginator',    {static: true, read: MatPaginator}) verifyPaginator: MatPaginator;
  @ViewChild('lockedSessionsPaginator',    {static: true, read: MatPaginator}) lockedSessionsPaginator: MatPaginator;

  constructor(public nav: NavbarService, private searchService: SearchService, private dateFormatPipe: DateFormatPipe,
    private spinner: NgxSpinnerService) {

  }

  isEmpty(val: string): boolean {

    if ((val === undefined || val === null || val.length === 0)) {
      return true;
    } else {
      return false;
    }

  }

  isHideLockPaymentRecords() {
    
    return localStorage.getItem('isAudit') == 'True'

  }

  ngOnInit() {
    this.searching = false;
    this.lockingByDate = false;
    this.verifyByDate = false;
    this.checkNumberForm = this.createFormGroup();
    this.lockForm = this.createLockFormGroup();
    this.verifyForm = this.createLockFormGroup();

    console.log(localStorage.getItem('isAdmin'));
    this.isAdmin = (localStorage.getItem('isAdmin') === 'True');
    console.log(this.isAdmin);


    this.nav.dashActive = '';
    this.nav.homeActive = '';
    this.nav.profileActive = '';
    this.nav.reportActive = '';
    this.nav.bidActive = '';
    this.nav.userActive = '';
    this.nav.searchActive = 'active';
    this.nav.paymentsActive = '';
    this.nav.show();

   this.refreshLockedList();

  }

  createFormGroup() {

    return new FormGroup({
      checkNumber: new FormControl(),
      vendor: new FormControl(),
      paymentDate: new FormControl()
    });
  }


  createLockFormGroup() {

    return new FormGroup({
      startDate: new FormControl(),
      endDate: new FormControl()
    });
  }
  ngAfterViewInit() {

    this.poDataSource.paginator = this.paymentPaginator;
    this.poPaymentList.paginator = this.paymentListPaginator
    this.lockedPaymentsList.paginator = this.lockPaginator;
    this.verifyPaymentsList.paginator = this.verifyPaginator;

    this.poLockedList.paginator = this.lockedSessionsPaginator

    this.poDataSource.sort = this.paymentSort;
    this.poPaymentList.sort = this.paymentListSort;
    this.lockedPaymentsList.sort = this.lockSort;
    this.verifyPaymentsList.sort = this.verifySort
    this.enableItemList = false;

  }

  search() {

    let parsedDate = null;

    const paymentDate: string = this.checkNumberForm.controls.paymentDate.value;

    if (!this.isEmpty(paymentDate)) {
      parsedDate = moment(paymentDate, ['M/D/YYYY']).format('MM-DD-YYYY');
    }
   
    console.log(parsedDate)
    
    // this.spinner.show();
    this.searching = true;
    const checkNumber: string = this.checkNumberForm.controls.checkNumber.value;
    const vendor: string = this.checkNumberForm.controls.vendor.value;
 
    this.refreshPoList(checkNumber, vendor, parsedDate);
  }

  disableButtons() {
    let returnVal = localStorage.getItem('isAudit');
    console.log(`isAudit = ${returnVal}`)
    return returnVal.toLowerCase() == 'true' ? false : true;
  }

  getLockedByDates(row) {

    const startDate: string = row.lockStartDate;
    const endDate: string = row.lockEndDate;

    let fuck = moment(startDate).add(8, 'hours')
    let me = moment(endDate).add(8, 'hours')

    const parsedStartDate = moment(fuck).format('MM-DD-YYYY');
    const parsedEndDate = moment(me).format('MM-DD-YYYY');
 

    this.searchService.getLockedByDateRange(parsedStartDate, parsedEndDate).subscribe(_data => {
      this.lockedPaymentsList.data = _data;

      console.log(_data.length);
      console.log(_data);

      if ((_data.length === undefined || _data.length === 'undefined' || _data.length === null || _data.length === 0 ) ) {
        // No Records returned
         this.enableLockList = true;
          this.noRowsMsg = '0 Locked Payments Found';
      } else {
        this.enableLockList = true;
        this.noRowsMsg =   _data.length + ' Locked Payments Found';
      }

    });



  }

  getLockedByDateRange() {

    const startDate: string = this.lockForm.controls.startDate.value;
    const endDate: string = this.lockForm.controls.endDate.value;

    const parsedStartDate = moment(this.lockForm.controls.startDate.value, ['M/D/YYYY']).format('MM-DD-YYYY');
    const parsedEndDate = moment(this.lockForm.controls.endDate.value, ['M/D/YYYY']).format('MM-DD-YYYY');
 

    this.searchService.getLockedByDateRange(parsedStartDate, parsedEndDate).subscribe(_data => {
      this.lockedPaymentsList.data = _data;

      console.log(_data.length);
      console.log(_data);

      if ((_data.length === undefined || _data.length === 'undefined' || _data.length === null || _data.length === 0 ) ) {
        // No Records returned
         this.enableLockList = true;
          this.noRowsMsg = '0 Locked Payments Found';
      } else {
        this.enableLockList = true;
        this.noRowsMsg =   _data.length + ' Locked Payments Found';
      }

    });

  }

  getVerifyByDateRange() {

    this.verifyByDate = true;

    const startDate: string = this.verifyForm.controls.startDate.value;
    const endDate: string = this.verifyForm.controls.endDate.value;

    this.searchService.getVerifyByDateRange(startDate, endDate).subscribe(_data => {
    this.verifyPaymentsList.data = _data;

      console.log(_data.length);
      console.log(_data);

      if ((_data.length === undefined || _data.length === 'undefined' || _data.length === null || _data.length === 0 ) ) {
        // No Records returned
          this.enableVerifyList = false;
          this.noRowsMsg = '0 Verified Payments Found';
      } else {
        this.enableVerifyList = true;
        this.noRowsMsg =   _data.length + ' Verified Payments Found';
      }
      this.verifyByDate = false;
    });

  }

  verifyDatePayments(): void {

    this.verifyByDate = true;

    const startDate: string = this.verifyForm.controls.startDate.value;
    const endDate: string = this.verifyForm.controls.endDate.value;

    this.searchService.verifyByDateRange(startDate, endDate).subscribe(_val => {
      console.log(_val.length);
      console.log(_val);

      this.delay(100).then(any => {
        this.searchService.getVerifyByDateRange(startDate, endDate).subscribe(_data => {
          this.verifyPaymentsList.data = _data;

          console.log(_data.length);
          console.log(_data);

          if ((_data.length === undefined || _data.length === 'undefined' || _data.length === null || _data.length === 0 ) ) {
            // No Records returned
             this.enableVerifyList = false;
              this.noRowsMsg = '0 Locked Payments Found';
          } else {
            this.enableVerifyList = true;
            this.noRowsMsg =   _data.length + ' Locked Payments Found';
          }
          this.verifyByDate = false;
        });
      });

    });

  }

  unVerifyPayments(): void {

    this.verifyByDate = true;
    // this.spinner.show();

    const startDate: string = this.verifyForm.controls.startDate.value;
    const endDate: string = this.verifyForm.controls.endDate.value;

    this.searchService.unVerifyByDateRange(startDate, endDate).subscribe(_val => {
      this.delay(100).then(any => {
        this.searchService.getVerifyByDateRange(startDate, endDate).subscribe(_data => {
          this.verifyPaymentsList.data = _data;

          console.log(_data.length);
          console.log(_data);

          if ((_data.length === undefined || _data.length === 'undefined' || _data.length === null || _data.length === 0 ) ) {
            // No Records returned
             this.enableVerifyList = true;
              this.noRowsMsg = '0 Verified Payments Found';
          } else {
            this.enableVerifyList = true;
            this.noRowsMsg =   _data.length + ' Verified Payments Found';
          }
          this.verifyByDate = false;
        });

      });

    });


  }

  unlockDatePaymentsByDate(startDate: string, endDate: string): void {

    console.log(` startDate ${startDate} `)
    console.log(` endDate ${endDate} `)

    const from =  moment(moment(startDate).add(8, 'hours')).format('MM-DD-YYYY');
    const to   =  moment(moment(endDate).add(8, 'hours')).format('MM-DD-YYYY');

    console.log(` from ${from}`)
    console.log(` to ${to}`)

    this.searchService.unLockByDateRange(from, to).subscribe(_val => {
    });

  }

  unlockDatePayments(): void {

    this.lockingByDate = true;
    // this.spinner.show();
    const parsedStartDate = moment(this.lockForm.controls.startDate.value, ['M/D/YYYY']).format('MM-DD-YYYY');
    const parsedEndDate = moment(this.lockForm.controls.endDate.value, ['M/D/YYYY']).format('MM-DD-YYYY');

    this.searchService.unLockByDateRange(parsedStartDate, parsedEndDate).subscribe(_val => {
      this.delay(1000).then(any => {
        this.searchService.getLockedByDateRange(parsedStartDate, parsedEndDate).subscribe(_data => {
          this.lockedPaymentsList.data = _data;

          console.log(_data.length);
          console.log(_data);

          if ((_data.length === undefined || _data.length === 'undefined' || _data.length === null || _data.length === 0 ) ) {
            // No Records returned
             this.enableLockList = true;
              this.noRowsMsg = '0 Locked Payments Found';
          } else {
            this.enableLockList = true;
            this.noRowsMsg =   _data.length + ' Locked Payments Found';
          }

        });

      });

    });

    this.lockingByDate = false;
    this.spinner.hide();

  }

  lockDatePayments(): void {

    this.lockingByDate = true;
    this.spinner.show();

    const parsedStartDate = moment(this.lockForm.controls.startDate.value, ['M/D/YYYY']).format('MM-DD-YYYY');
    const parsedEndDate = moment(this.lockForm.controls.endDate.value, ['M/D/YYYY']).format('MM-DD-YYYY');
    const createdBy = this.getCurrentUserName();

    this.searchService.lockByDateRange(parsedStartDate, parsedEndDate, createdBy).subscribe(_val => {
      console.log(_val.length);
      console.log(_val);

      this.delay(100).then(any => {
        this.searchService.getLockedByDateRange(parsedStartDate, parsedEndDate).subscribe(_data => {
          this.lockedPaymentsList.data = _data;

          console.log(_data.length);
          console.log(_data);

          if ((_data.length === undefined || _data.length === 'undefined' || _data.length === null || _data.length === 0 ) ) {
            // No Records returned
             this.enableLockList = true;
              this.noRowsMsg = '0 Locked Payments Found';
          } else {
            this.enableLockList = true;
            this.noRowsMsg =   _data.length + ' Locked Payments Found';
          }

          this.refreshLockedList();

        });

      });

    });

    this.lockingByDate = false;

  }

  onItemRowClicked(row) {

  }

  onRowClicked(row) {

    this.selectedPO = row;

    this.selectedPO.poIssueDate = this.formatDate(this.selectedPO.poIssueDate);
    this.selectedPO.dateReported = this.formatDate(this.selectedPO.dateReported);


    this.refreshItemList(row.paymentCheckNum, row.dealerName);

  }

  private getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  async deleteLockedRows(row) {

    console.log(` row = ${JSON.stringify(row)} `)

    if (confirm(` Are you sure you want to remove the lock from ALL PAYMENTS between ${row.lockStartDate} and ${row.lockEndDate} `)) {

      this.unlockDatePaymentsByDate(row.lockStartDate, row.lockEndDate);

      this.delay(250).then( any => {
        this.refreshLockedList()
       
      });

    }

  }

  deleteAllPayments(row) {

    if (row.lockStatus == null || row.lockStatus === 'U') {

      if (confirm('Are you sure you want to delete ALL PAYMENTS with check number   ' + row.paymentCheckNum + '?')) {

        this.searchService.deleteByCheckNumber(row.paymentCheckNum, row.dealerName).subscribe(_val => {
          console.log(_val.length);
        });

        this.refreshItemList(row.paymentCheckNum, row.dealerName);
        this.delay(250).then(any => {
          this.refreshPoList(row.paymentCheckNum, 'empty', 'empty');
        });

      }
    }

  }

  showFilter() {

    if (this.purchaseOrders.length > 0) {
      return true;
    } else {
      return false;
    }

  }

  filterBids(filterVal: string) {
    console.log(filterVal);

    this.refreshPoList(filterVal, 'empty', 'empty');
    this.selectedPO = null;

  }

  refreshItemList(checkNum: string, dealerName: string) {

    this.searchService.getByCheckNumberDealer(checkNum, dealerName).subscribe(_val => {
      //    this.purchaseOrders = _val;
      this.poPaymentList.data = _val;

      //   this.enablePoList = true;
      this.enableItemList = true;

      console.log(_val.length);

    });


  }

   async refreshLockedList()  {

   (await this.searchService.getPaymentLockedList()).subscribe(_val => {
     console.log(` _val from refreshLockedList() ${_val.length} `)
       this.poLockedList.data = _val;
       this.enableLockedList = true;
     });


  }

   refreshPoList(checkNum: string, vendor: string, paymentDate: string) {

    console.log(paymentDate)

     this.searchService.getByCheckNumber(checkNum, vendor, paymentDate).subscribe(po => {
      this.purchaseOrders = po;
      this.poPaymentList.data = po;
      this.poDataSource.data = po;
      this.enablePoList = true;
      this.poPaymentList.data = [];
      this.enableItemList = false;

      console.log(this.purchaseOrders.length);

      this.spinner.hide();
      this.searching = false;

    });


  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log('fired'));
  }

  formatDate(dateVal: Date) {
    console.log(dateVal);
    //  dateVal.setHours(2);
    const myDate = this.dateFormatPipe.transform(dateVal);
    console.log(myDate);
    return myDate;

  }

  lockPayments(row): void {

    console.log(row.lockStatus)

    if (row.lockStatus == null || row.lockStatus === 'U') {

      if (confirm('Are you sure you want to lock ALL PAYMENTS with check number   ' + row.paymentCheckNum + '?')) {

        this.searchService.lockByCheckNumber(row.paymentCheckNum, row.dealerName).subscribe(_val => {
          console.log(_val.length);
        });

        //  this.refreshItemList(row.paymentCheckNum, row.dealerName);
        this.delay(250).then(any => {
          this.refreshPoList(row.paymentCheckNum, 'empty', 'empty');
        });

      }

    } else {

      if (confirm('Are you sure you want to UNLOCK ALL PAYMENTS with check number   ' + row.paymentCheckNum + '?')) {

        this.searchService.unLockByCheckNumber(row.paymentCheckNum, row.dealerName).subscribe(_val => {
          console.log(_val.length);
        });

        //  this.refreshItemList(row.paymentCheckNum, row.dealerName);
        this.delay(250).then(any => {
          this.refreshPoList(row.paymentCheckNum,'empty', 'empty');
        });

      }



    }

  }

  verifyPayments(row): void {

    console.log(row.verifiedStatus)

    if (row.verifyIcon === null  || row.verifyIcon === 'fa fa-square-o' ) {

      if (confirm('Are you sure you want to Verify All Payments with check number ' + row.paymentCheckNum
      + ' and Vendor ' +  row.dealerName + ' ?')) {

        this.searchService.verifyByCheckNumber(row.paymentCheckNum, row.dealerName).subscribe(_val => {
          console.log(_val.length);
        });

        //  this.refreshItemList(row.paymentCheckNum, row.dealerName);
        this.delay(250).then(any => {
          this.refreshPoList(row.paymentCheckNum, 'empty', 'empty');
        });

      }

    } else {

      if (confirm('Are you sure you want to Unverify All Payments with check number   ' + row.paymentCheckNum + '?')) {

        this.searchService.resetVerifyByCheckNumber(row.paymentCheckNum, row.dealerName).subscribe(_val => {
          console.log(_val.length);
        });

        //  this.refreshItemList(row.paymentCheckNum, row.dealerName);
        this.delay(250).then(any => {
          this.refreshPoList(row.paymentCheckNum,'empty','empty');
        });

      }



    }

  }

}
