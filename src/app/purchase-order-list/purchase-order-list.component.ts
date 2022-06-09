import { Component, Input, Output, ViewChild, OnInit, AfterViewInit, ElementRef, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';

import {
  PurchaseOrder, Dealer, CityAgency, BidType, Payment, BidNumber,
  ItemBidTypeCode, PoStatusType, Specification, AgencyType
} from '../model/index';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { ToastrService } from 'ngx-toastr';
import { DateFormatPipe } from '../dateFormat/date-format-pipe.pipe';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { ItemPaymentComponent } from '../item-payment/item-payment.component';
import { ItemListComponent } from '../item-list/item-list.component';

import { PurchaseOrderDetailComponent } from '../purchase-order-detail/purchase-order-detail.component';
import { SearchByCheckComponent } from '../search-by-check/search-by-check.component';
import { async } from 'rxjs';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.scss']
})

export class PurchaseOrderListComponent implements OnInit, AfterViewInit {

  private missionAnnouncedSource = new Subject<string>();
  private missionConfirmedSource = new Subject<string>();

  displayedColumns = ['bidNumber', 'cityAgency', 'dealerName', 'poNumber',
    'poIssueDate', 'dateReported', 'poAmount', 'balance', 'edit', 'addPayment'];

  paymentColumns = ['paymentDate', 'paymentAmount', 'paymentNumber', 'paymentCheckNum', 'edit', 'delete'];
  poDataSource = new MatTableDataSource();
  paymentDataSource = new MatTableDataSource();
  purchaseOrders: PurchaseOrder[] = [];
  dealers: Dealer[] = [];
  bidNumbers: BidNumber[] = [];
  cityAgencies: CityAgency[] = [];
  itemTypeCodes: ItemBidTypeCode[] = [];
  bidTypes: BidType[] = [];
  payment: Payment[] = [];
  showPayment: Boolean = false;
  showNewPayment: Boolean = false;
  bids: String[] = [];
  fuck: Boolean = false;
  specs: Specification[] = [];
  poStatusTypeCodes: PoStatusType[] = [];
 // agencyCodes: AgencyType[] = [];

  selectedPO: PurchaseOrder;
  selectedPayCd: string;
  selectedPoId: number;

  selectedPayment: Payment;
  currentBid: BidNumber;
  dateFailed: boolean;

  newPoForm: FormGroup;
  paymentForm: FormGroup;
  poForm: FormGroup;

  myDate: Date;
  minDate: Date;
  maxDate: Date;
  isNewPo: Boolean;
  bidId: String;
  bidType: string;
  enableItemDetail: boolean;
  enableItemList: boolean;
  enablePoList: boolean;
  enablePoDetail: boolean;
  enableSearch: boolean;
  poSearchVal: string;
  searching: boolean;
  readOnly: boolean;

  @ViewChild('poFocus', {static: true}) poFocus: ElementRef;
  @ViewChild('paymentFocus', {static: true}) paymentFocus: ElementRef;
  @ViewChild('searchInputFocus', {static: true}) searchInputFocus: ElementRef;
  @Output() refreshPoDetail: EventEmitter<number> = new EventEmitter();
  
  @ViewChild(ItemPaymentComponent, {static: true}) item: ItemPaymentComponent;
  @ViewChild(ItemListComponent, {static: true}) itemList: ItemListComponent;
  @ViewChild(PurchaseOrderDetailComponent, {static: true}) purchaseOrderDetailComponent: PurchaseOrderDetailComponent;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private poService: PurchaseOrderService, private toastr: ToastrService,
    private dateFormatPipe: DateFormatPipe) {

    this.enableItemDetail = false;
    this.enablePoList = false;
    this.enablePoDetail = false;

    console.log(moment.locale()); // en
    moment.locale('en');
    console.log(moment.locale()); // en
    moment.locale('pt-BR');
    console.log(moment.locale()); // pt-BR

    this.myDate = new Date();
    this.readOnly = this.poService.isReadOnly();

  }

  ngAfterViewInit() {
    this.poDataSource.sort = this.sort;
    this.poDataSource.paginator = this.paginator;
    this.readOnly =  this.poService.isReadOnly();

  //   this.paymentDataSource.paginator = this.paymentPaginator;
  //   this.paymentDataSource.sort = this.paymentSort;
  }


  refreshPurchaseOrderListHandler(bidId: string) {
    this.sendData(bidId);
  }

  isReadOnly() {
    console.log(this.poService.isReadOnly());
    return this.poService.isReadOnly();
   }

  statusClicked(val: string) {

    this.enableSearch = true;
    this.poSearchVal = val;
    console.log('Val = ' + val);

  }

  isEmpty(val: string): boolean {
    if ((val === undefined || val === null || val.length === 0)) {
      return true;
    } else {
      return false;
    }

  }

  search() {

    if (!(this.isEmpty(this.poSearchVal))) {
      this.searching = true;

      console.log(this.bidId);
      console.log(this.poSearchVal);

      this.delay(250).then(any => {
        this.poService.getPoByPoId(this.poSearchVal).subscribe(po => {
          this.purchaseOrders = po;
          this.poDataSource.data = po;

          console.log(this.purchaseOrders.length);

          this.enablePoList = (this.purchaseOrders.length > 0 ? true : false);
          this.enablePoDetail = false;
          this.enableItemList = false;
          this.searching = false;

        });
      });

    } else {
      this.searching = false;
    }


  }

  getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  deletePurchaseOrder(row) {

    let hasPayment = false;

    const promise = this.poService.getPoHasPayment(row.id).toPromise();
    promise.then((data) => {
      if (data.length > 0) {
        hasPayment = true;
        alert('Unable to delete Purchase Order. Purchase Order ' + row.poNumber  + ' has PO Items with applied payment(s).');
        return
      } else {

        if (confirm('Are you sure you want to delete PO?  ' + row.poNumber + ' - ' + row.dealerName)) {

          row.markAsDeleted = '1';
          row.updatedBy = this.getCurrentUserName();

          this.poService.updatePurchaseOrder(row).subscribe(po => {
          });

          this.enablePoDetail = false;
          this.enableItemDetail = false;
          this.enableItemList = false;

          this.refreshPoList(row.bidNumber);

          this.toastr.success('Purchase Order delete Successful', 'Purchase Delete', {
            timeOut: 2000,
          });

        }
      }

      console.log('Promise resolved with: ' + JSON.stringify(data));
      console.log(data);
    }, (error) => {
      console.log('Promise rejected with ' + JSON.stringify(error));
    })

  }

  newItem() {
    this.itemList.chain();
  }

  onRowClicked(row: any): void {

    const localDate: Date = new Date(row.poIssueDate);
    localDate.setHours(localDate.getHours() + 6);
    this.poService.currentPoIssueDateItem = localDate

    // console.log( this.poService.currentPoIssueDateItem);

    // Set the Po Item Detail screen to hidden until the Item is selected on the Item list
    this.enableItemDetail = false;
    this.enableItemList = true;
    this.enablePoDetail = true;

    this.selectedPayCd = row.payCd;
    this.selectedPoId = row.id;
    console.log('Row clicked: ', row);

    this.bidId = row.bidNumber;

    this.poService.getAdminFee(row.bidNumber)
      .subscribe(bid => {
        this.currentBid = bid[0];
        //    this.enablePoList  = (bid.length > 0 ? true : false);
      });

    if (this.itemList !== undefined) {
      this.itemList.setItemListRowSelected(false);
    }

    this.dateFailed = false;
    this.isNewPo = false;

    this.selectedPO = row;

    this.selectedPO.poIssueDate = this.formatDate(this.selectedPO.poIssueDate);
    this.selectedPO.dateReported = this.formatDate(this.selectedPO.dateReported);

    this.selectedPayment = null;
    this.showPayment = true;
    this.showNewPayment = false;
    this.fuck = false;

    if (this.itemList !== undefined) {
      this.itemList.getItems(row.id);
    }

    if (this.purchaseOrderDetailComponent !== undefined) {
      this.purchaseOrderDetailComponent.getPurchaseOrder(row.id);
      this.purchaseOrderDetailComponent.getItems(row.id);
    }

    this.purchaseOrderDetailComponent.focusPoDetail();

  }

  createFormGroup() {

    return new FormGroup({

      bidNumber: new FormControl('', Validators.required),
      poNumber: new FormControl('', Validators.required),
      poIssueDate: new FormControl('', Validators.required),
      dateReported: new FormControl('', Validators.required),
      //     estimatedDelivery: new FormControl(),
      cityAgency: new FormControl('', Validators.required),
      dealerName: new FormControl('', Validators.required),
      //    spec: new FormControl('', Validators.required),
      //    vehicleType: new FormControl('', Validators.required),
      agencyFlag: new FormControl(),
      dealerFlag: new FormControl(),
      poComplete: new FormControl(),
      poFinal: new FormControl(),
      //     qty: new FormControl(),
      poAmount: new FormControl(),
      //    actualPo: new FormControl(),
      adminFeeDue: new FormControl({ disabled: true }),
      comments: new FormControl(),
      payCd: new FormControl(),
    }, this.validateFormDates);
  }

  createPaymentFormGroup() {

    return new FormGroup({

      paymentDate: new FormControl('', Validators.required),
      paymentAmount: new FormControl('', Validators.required),
      paymentNumber: new FormControl('', Validators.required),
      paymentCheckNum: new FormControl('', Validators.required),
      fsaAlloc: new FormControl(),
      facAlloc: new FormControl('', Validators.required),
      totalAlloc: new FormControl('', Validators.required),
      ffcaAlloc: new FormControl('', Validators.required),
      lateFeeAmt: new FormControl('', Validators.required),
      lateFeeCheckNum: new FormControl(),
      lateFeeCheckDate: new FormControl(),
      fsaRefundAmount: new FormControl(),
      fsaRefundCheckNum: new FormControl(),
      fsaRefundDate: new FormControl(),
      correction: new FormControl(),
      auditDifference: new FormControl(),
    }, this.validatePaymentFormDates);
  }



  copyPaymentModelToForm() {

    if (this.selectedPayment != null) {

      this.paymentForm.controls['paymentNumber'].patchValue(this.selectedPayment.paymentNumber, { emitEvent: false });
      console.log(this.selectedPayment.paymentNumber);
      this.paymentForm.controls['paymentDate'].patchValue(this.selectedPayment.paymentDate, { emitEvent: false });
      this.paymentForm.controls['paymentCheckNum'].patchValue(this.selectedPayment.paymentCheckNum, { emitEvent: false });
      this.paymentForm.controls['paymentAmount'].patchValue(this.selectedPayment.paymentAmount, { emitEvent: false });
      this.paymentForm.controls['fsaAlloc'].patchValue(this.selectedPayment.fsaAlloc, { emitEvent: false });
      this.paymentForm.controls['facAlloc'].patchValue(this.selectedPayment.facAlloc, { emitEvent: false });
      this.paymentForm.controls['ffcaAlloc'].patchValue(this.selectedPayment.ffcaAlloc, { emitEvent: false });
      this.paymentForm.controls['totalAlloc'].patchValue(this.selectedPayment.totalAlloc, { emitEvent: false });
      this.paymentForm.controls['lateFeeAmt'].patchValue(this.selectedPayment.lateFeeAmt, { emitEvent: false });
      this.paymentForm.controls['lateFeeCheckNum'].patchValue(this.selectedPayment.lateFeeCheckNum, { emitEvent: false });
      this.paymentForm.controls['lateFeeCheckDate'].patchValue(this.selectedPayment.lateFeeCheckDate, { emitEvent: false });

      this.paymentForm.controls['fsaRefundAmount'].patchValue(this.selectedPayment.fsaRefundAmount, { emitEvent: false });
      this.paymentForm.controls['fsaRefundCheckNum'].patchValue(this.selectedPayment.fsaRefundCheckNum, { emitEvent: false });
      this.paymentForm.controls['fsaRefundDate'].patchValue(this.selectedPayment.fsaRefundDate, { emitEvent: false });

      this.paymentForm.controls['correction'].patchValue(this.selectedPayment.correction, { emitEvent: false });
      this.paymentForm.controls['auditDifference'].patchValue(this.selectedPayment.auditDifference, { emitEvent: false });

    }

  }

  copyPaymentFormToModel() {

    this.selectedPayment.paymentDate = this.paymentForm.controls.paymentDate.value;
    this.selectedPayment.paymentAmount = this.paymentForm.controls.paymentAmount.value;
    this.selectedPayment.paymentNumber = this.paymentForm.controls.paymentNumber.value;
    this.selectedPayment.paymentCheckNum = this.paymentForm.controls.paymentCheckNum.value;
    this.selectedPayment.fsaAlloc = this.paymentForm.controls.fsaAlloc.value;
    this.selectedPayment.facAlloc = this.paymentForm.controls.facAlloc.value;
    this.selectedPayment.ffcaAlloc = this.paymentForm.controls.ffcaAlloc.value;
    this.selectedPayment.totalAlloc = this.paymentForm.controls.totalAlloc.value;
    this.selectedPayment.lateFeeAmt = this.paymentForm.controls.lateFeeAmt.value;
    this.selectedPayment.lateFeeCheckNum = this.paymentForm.controls.lateFeeCheckNum.value;
    this.selectedPayment.lateFeeCheckDate = this.paymentForm.controls.lateFeeCheckDate.value;
    this.selectedPayment.fsaRefundAmount = this.paymentForm.controls.fsaRefundAmount.value;
    this.selectedPayment.fsaRefundCheckNum = this.paymentForm.controls.fsaRefundCheckNum.value;
    this.selectedPayment.fsaRefundDate = this.paymentForm.controls.fsaRefundDate.value;
    this.selectedPayment.correction = this.paymentForm.controls.correction.value;
    this.selectedPayment.auditDifference = this.paymentForm.controls.auditDifference.value;

  }

  copyFormToModel() {

    this.selectedPO.bidNumber = this.poForm.controls.bidNumber.value;
    this.selectedPO.poNumber = this.poForm.controls.poNumber.value;
    this.selectedPO.poIssueDate = this.poForm.controls.poIssueDate.value;
    this.selectedPO.dateReported = this.poForm.controls.dateReported.value;
    // this.selectedPO.estimatedDelivery = this.poForm.controls.estimatedDelivery.value;
    this.selectedPO.cityAgency = this.poForm.controls.cityAgency.value;
    this.selectedPO.dealerName = this.poForm.controls.dealerName.value;
    // this.selectedPO.spec = this.poForm.controls.spec.value;
    //  this.selectedPO.vehicleType  = this.poForm.controls.vehicleType.value;
    this.selectedPO.agencyFlag = this.poForm.controls.agencyFlag.value;
    this.selectedPO.dealerFlag = this.poForm.controls.dealerFlag.value;
    this.selectedPO.poStatus = this.poForm.controls.poStatus.value;
    this.selectedPO.poAmount = this.poForm.controls.poAmount.value;
    // this.selectedPO.actualPo = this.poForm.controls.actualPo.value;
    this.selectedPO.adminFeeDue = this.poForm.controls.adminFeeDue.value;
    this.selectedPO.comments = this.poForm.controls.comments.value;
    this.selectedPO.payCd = this.poForm.controls.payCd.value;
    // this.selectedPO.qty = this.poForm.controls.qty.value;

  }


  copyModelToForm() {

    if (this.selectedPO != null) {

      const fname: string = this.selectedPO.dealerName;
      console.log(fname);

      this.poForm.controls['bidNumber'].patchValue(this.selectedPO.bidNumber, { emitEvent: false });
      console.log(this.selectedPO.poNumber);
      this.poForm.controls['poNumber'].patchValue(this.selectedPO.poNumber, { emitEvent: false });
      this.poForm.controls['poIssueDate'].patchValue(this.selectedPO.poIssueDate, { emitEvent: false });
      this.poForm.controls['dateReported'].patchValue(this.selectedPO.dateReported, { emitEvent: false });
      //  this.poForm.controls['estimatedDelivery'].patchValue(this.selectedPO.estimatedDelivery, {emitEvent : false});
      this.poForm.controls['cityAgency'].patchValue(this.selectedPO.cityAgency, { emitEvent: false });
      this.poForm.controls['dealerName'].patchValue(this.selectedPO.dealerName, { emitEvent: false });
      // this.poForm.controls['spec'].patchValue(this.selectedPO.spec, {emitEvent : false});
      // this.poForm.controls['vehicleType'].patchValue(this.selectedPO.vehicleType, {emitEvent : false});
      this.poForm.controls['agencyFlag'].patchValue(this.selectedPO.agencyFlag, { emitEvent: false });
      this.poForm.controls['dealerFlag'].patchValue(this.selectedPO.dealerFlag, { emitEvent: false });
      this.poForm.controls['poStatus'].patchValue(this.selectedPO.poStatus, { emitEvent: false });

      // this.poForm.controls['qty'].patchValue(this.selectedPO.qty, {emitEvent : false});
      this.poForm.controls['poAmount'].patchValue(this.selectedPO.poAmount, { emitEvent: false });
      // this.poForm.controls['actualPo'].patchValue(this.selectedPO.actualPo, {emitEvent : false});

      this.poForm.controls['adminFeeDue'].patchValue(this.selectedPO.adminFeeDue, { emitEvent: false });
      this.poForm.controls['comments'].patchValue(this.selectedPO.comments, { emitEvent: false });
      this.poForm.controls['payCd'].patchValue(this.selectedPO.payCd, { emitEvent: false });
      // this.poService.getItem(this.selectedPO.bidNumber).subscribe(data => {this.specs = data; });
    }

  }

  partialClearPo() {

    this.poForm.controls['poNumber'].patchValue('12', { emitEvent: false });
    this.poForm.controls['poStatus'].patchValue('', { emitEvent: false });

    // this.poForm.controls['qty'].patchValue('', {emitEvent : false});
    this.poForm.controls['poAmount'].patchValue('', { emitEvent: false });
    // this.poForm.controls['actualPo'].patchValue('', {emitEvent : false});

    this.poForm.controls['adminFeeDue'].patchValue('', { emitEvent: false });
    this.poForm.controls['comments'].patchValue('', { emitEvent: false });

  }

  validatePaymentFormDates(g: FormGroup) {

    return { mismatch: false };

  }

  validateFormDates(g: FormGroup) {

    // This was required at the patchValue was setting the date and the
    // datepicker was setting the date as Wed Sep 05 2018 00:00:00 GMT-0500
    // and the date that wasn't changed was short date MM/DD/YYYY
    // convereted both to the datepicker format DDD MM DD YYYY

    const poDateNew: Date = new Date(g.get('poIssueDate').value);
    const reportedDateNew: Date = new Date(g.get('dateReported').value);

    const isValid: boolean = reportedDateNew > poDateNew;

    return isValid ? null : { mismatch: true };

  }

  editName() {
    this.poFocus.nativeElement.focus();
  }


  purchaserChange(event) {

    const newVal = event.target.value;

    this.poService.getPayCode(newVal)
      .subscribe(cd => {
        this.selectedPO.payCd = cd[0].agencyPayCode;
        console.log(cd);
        console.log(cd[0].agencyTypeId);
        console.log(cd.agencyTypeId);
      });
    console.log(this.selectedPO.payCd);
    console.log(this.selectedPO);
  }


  async sendData(bidId: string) {

   await this.refreshPoList(bidId);

  }

 async refreshPoList(bidId: string)  {

  //  this.delay(250).then(any => {
      this.poService.getByBidNumber(bidId).subscribe(po => {
        this.purchaseOrders = po;
        this.poDataSource.data = po;

        console.log(this.purchaseOrders.length);
        this.searching = false;

      });
  //  });

  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log('fired'));
  }

  revert() {
    // Resets to blank object
    this.poForm.reset();

    // Resets to provided model
    this.poForm.reset({ purchaseOrderData: new PurchaseOrder() });
  }

  onSubmit() {
    // Make sure to create a deep copy of the form-model
    const result: PurchaseOrder = Object.assign({}, this.poForm.value);
    // result.purchaseOrderData = Object.assign({}, result.purchaseOrderData);

    // Do useful stuff with the gathered data
    console.log(result);
  }

  showFilter() {

    if (this.purchaseOrders.length > 0) {
      return true;
    } else {
      return false;
    }

  }


  onSelectPayment(payment: Payment) {
    this.selectedPayment = payment;
    this.showPayment = true;
    this.fuck = false;

    this.selectedPayment.paymentDate = this.formatDate(this.selectedPayment.paymentDate);
    this.selectedPayment.lateFeeCheckDate = this.formatDate(this.selectedPayment.lateFeeCheckDate);
    this.selectedPayment.fsaRefundDate = this.formatDate(this.selectedPayment.fsaRefundDate);

    this.copyPaymentModelToForm();

  }

  formatDate(dateVal: Date) {
    console.log(dateVal);
    //  dateVal.setHours(2);
    const myDate = this.dateFormatPipe.transform(dateVal);
    console.log(myDate);
    return myDate;

  }

  filterVehicleTypes(filterVal: string) {
    console.log(filterVal);
    console.log(this.selectedPO.bidNumber);
    //  console.log(this.selectedPO.spec);

    this.poService.getItemType(this.selectedPO.bidNumber, filterVal)
      .subscribe(data => {
        this.itemTypeCodes = data;
      });

  }

  filterSpecifications(filterVal: string) {

    // reset the VehicleTypes
    this.itemTypeCodes = null;

    /*   this.poService.getItem(filterVal)
       .subscribe(data => {
           this.specs = data;
       }); */

  }

  deletePo(po: PurchaseOrder): void {

    console.log(po);

  }

  onSelectPurchaseOrder(po: PurchaseOrder): void {

    this.poFocus.nativeElement.focus();

    this.enableItemList = true;

    this.enableItemDetail = false;

    this.selectedPayCd = po.payCd;
    this.selectedPoId = po.id;
    this.bidId = po.bidNumber;

    this.dateFailed = false;
    this.isNewPo = false;

    this.selectedPO = po;
    this.selectedPayCd = po.payCd;
    this.selectedPoId = po.id;

    this.selectedPO.poIssueDate = this.formatDate(this.selectedPO.poIssueDate);
    this.selectedPO.dateReported = this.formatDate(this.selectedPO.dateReported);

    this.poService.currentPoIssueDateItem = this.selectedPO.poIssueDate;

    this.selectedPayment = null;
    this.showPayment = true;
    this.showNewPayment = false;
    this.fuck = false;

    this.poService.getPayment(po.id)
      .subscribe(payment => {
        this.payment = payment;
        this.paymentDataSource.data = payment;

      });

    /*   this.poService.getItemType(po.bidNumber, po.spec)
       .subscribe(itemTypeCodes => {
           this.itemTypeCodes = itemTypeCodes;
       }); */

    this.poService.getBids()
      .subscribe(bids => {
        this.bids = bids;
        this.bidNumbers = bids;
      });

    if (this.itemList !== undefined) {
      this.itemList.getItems(po.id);
    }

    if (this.purchaseOrderDetailComponent !== undefined) {
      this.purchaseOrderDetailComponent.getPurchaseOrder(po.id);
    }

    // this.purchaseOrderDetailComponent.getPurchaseOrder2();

  }

  resetView() {

    this.enablePoDetail = false
    this.enableItemDetail = false;
    this.enableItemList = false;
    // this.enablePoList: boolean;
    this.enablePoDetail = false;

  }

  filterBids(filterVal: string) {
    this.searching = true;
    console.log(filterVal);

    this.poSearchVal = '';
    this.searchInputFocus.nativeElement.value = '';

    this.bidId = filterVal;
    this.resetView();

    this.poService.getAdminFee(filterVal)
      .subscribe(bid => {
        this.currentBid = bid[0];
        this.enablePoList = (bid.length > 0 ? true : false);
      });

    this.refreshPoList(filterVal);

    /*
        this.poService.getByBidNumber(filterVal)
        .subscribe(po => {
            this.purchaseOrders = po;
            this.poDataSource.data = po;

        });
    */

    this.selectedPO = null;

  }

  filterSpec(filterVal: string) {
    console.log(filterVal);
  }

  ngOnInit() {

    this.selectedPayCd = '';
    this.selectedPoId = 0;

    this.poForm = this.createFormGroup();
    this.paymentForm = this.createPaymentFormGroup();

    this.poService.getPostatusType()
      .subscribe(codes => {
        this.poStatusTypeCodes = codes;
      });

    /*   this.poService.getDealer()
       .subscribe(_dealers => {
           this.dealers = _dealers;
       });  */

    this.poService.getCityAgency()
      .subscribe(_cityAgency => {
        this.cityAgencies = _cityAgency;
      });

    this.poService.getBidType()
      .subscribe(_bidType => {
        this.bidTypes = _bidType;
      });

    this.poService.getBidNumber()
      .subscribe(_bidNum => {
        this.bidNumbers = _bidNum;
      });

    //  console.log(this.bidNumbers);
    //  console.log(this.bidTypes);

    this.formControlValueChanged();

  }

  formControlValueChanged() {

    this.poForm.get('poAmount').valueChanges.subscribe(
      _poAmount => {
        console.log('poAmount changed ' + _poAmount);
        if (!(this.poForm.get('actualPo').value > 0)) {
          if (_poAmount >= 0) {
            this.poForm.patchValue({ 'adminFeeDue': this.calculateAdminFee(_poAmount) });
          }
        }
      });

    /*   this.poForm.get('actualPo').valueChanges.subscribe(
          _actualPo => {
            if ( _actualPo >= 0) {
            console.log(this.calculateAdminFee(_actualPo));
            this.poForm.patchValue({'adminFeeDue': this.calculateAdminFee(_actualPo)});
            }
          }); */

    this.poForm.get('cityAgency').valueChanges.subscribe(
      _cityAgency => {
        this.poService.getPayCode(_cityAgency).subscribe(cd => {
          this.selectedPO.payCd = cd[0].agencyPayCode
        });
      });

    this.poForm.get('bidNumber').valueChanges.subscribe(
      _bidNumber => {
        this.itemTypeCodes = null;
        this.poService.getItem(_bidNumber).subscribe(data => { this.specs = data; });
        this.poService.getAdminFee(_bidNumber).subscribe(bid => {
        this.currentBid = bid[0];
          console.log(this.currentBid.AdminFeeRate);
        });
      });
  }


  applyUserFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.poDataSource.filter = filterValue;
  }

  cancelPayment() {
  this.selectedPayment = null;
  }

  showNewPurchaseOrder() {
    this.partialClearPo();
    this.showNewPayment = true;
    this.showPayment = false;
  }

  newPurchaseOrder() {

    this.poService.getBids()
      .subscribe(bids => {
        this.bids = bids;
        this.bidNumbers = bids;
      });

    this.enableItemList = false;
    this.enableItemDetail = false;
    this.isNewPo = true;
    this.enablePoDetail = true;
    this.purchaseOrderDetailComponent.newPo();

  }


  newPayment(po: PurchaseOrder) {
    this.onSelectPurchaseOrder(po);
    this.selectedPayment = new Payment();
    this.selectedPayment.fsaReportId = po.id;
    this.showPayment = true;
    this.fuck = true;

    this.paymentFocus.nativeElement.focus();

  }

  newPayment2() {
    this.selectedPayment = new Payment();
    this.copyPaymentModelToForm();
    this.selectedPayment.fsaReportId = this.selectedPO.id;
    this.showPayment = true;
    this.fuck = true;

    this.paymentFocus.nativeElement.focus();
  }

  calculateAdminFee(poAmount: number) {
    return this.truncateDecimals(poAmount * parseFloat(this.currentBid.AdminFeeRate), 2);

  }

  truncateDecimals(poAmount: number, places: number) {
    const shift = Math.pow(10, places);

    return ((poAmount * shift) | 0) / shift;
  };


  updatePurchaseOrder() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // let adminCalc: number;

    this.copyFormToModel();
    /*
        if  ( Number(this.selectedPO.actualPo) > 0 ) {
          adminCalc = this.calculateAdminFee(Number(this.selectedPO.actualPo));
        } else if (Number(this.selectedPO.poAmount) > 0 )   {
          adminCalc = this.calculateAdminFee(Number(this.selectedPO.poAmount));
        }
        this.selectedPO.adminFeeDue = adminCalc;
    */
    this.selectedPO.updatedBy = currentUser.username;

    if (this.selectedPO.dealerFlag) {
      this.selectedPO.dealerFlag = 'X';
    } else {
      this.selectedPO.dealerFlag = '';
    }

    if (this.selectedPO.agencyFlag) {
      this.selectedPO.agencyFlag = 'X';
    } else {
      this.selectedPO.agencyFlag = '';
    }

    console.log(this.selectedPO.dealerFlag);
    console.log(this.selectedPO.agencyFlag);

    if (this.poForm.invalid) {
      this.dateFailed = true;
      return;
    } else {
      this.dateFailed = false;
    }

    this.poService.updatePurchaseOrder(this.selectedPO).subscribe(po => {
      //  this.selectedPO = po;
      // this.myForm.reset();
    });

    this.toastr.success('PO Saved Successful', 'PO Update', {
      timeOut: 2000,
    });

    this.sendData(this.selectedPO.bidNumber);

  }

  insertPayment() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.selectedPayment.updatedBy = currentUser.username;
    this.copyPaymentFormToModel();

    this.poService.createPayment(this.selectedPayment).subscribe(payment => {
      this.selectedPayment = payment;
      this.selectedPayment = null;
    });

    this.toastr.success('Payment Insert Successful', 'Payment Insert', {
      timeOut: 2000,
    });

    this.poService.getPayment(this.selectedPO.id)
      .subscribe(payment => {
        this.payment = payment;
        this.paymentDataSource.data = payment;

      });


  }

  updatePayment() {
    this.copyPaymentFormToModel();
    this.poService.updatePayment(this.selectedPayment).subscribe(po => {
      this.selectedPayment = null;
    });

    this.toastr.success('Payment Saved Successful', 'Payment Update', {
      timeOut: 2000,
    });

  }

}
