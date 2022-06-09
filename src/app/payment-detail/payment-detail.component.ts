import { Component, OnInit, Output, ViewChild, ElementRef, EventEmitter,  OnChanges, SimpleChanges, Input,
  AfterContentInit, AfterViewChecked, TestabilityRegistry } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PurchaseOrder, BidType , Payment, PaymentLock} from '../model/index';
import { BidNumber, Item, AdminFeeDistributionPct } from '../model/index';
import { ContactRequest } from '../model/contact-request';
import { PersonalData } from '../model/contact-request';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { ItemService } from '../services/item.service';
import { SearchService } from '../services/search.service';
import { ToastrService } from 'ngx-toastr';
import { ItemBidTypeCode } from '../model/itemBidTypeCode';
import { DateFormatPipe } from '../dateFormat/date-format-pipe.pipe';
import { AfterViewInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.scss']
})
export class PaymentDetailComponent implements OnInit {

  paymentForm: FormGroup;
  @Output() refreshPaymentList: EventEmitter<number> =   new EventEmitter();
  @ViewChild('paymentFocus', {static: true}) paymentFocus: ElementRef;
  @Input() payCd: string;
  @Input() bidType: string;
  @Input() paymentId: number;
  @Input() adminFeeRate: number;
  @Input() test: number;
  @Input() poId: number;   // leave this for now
  @Input() itemId: number;
  @Input() paymentNumber: number;

  isNew: boolean;
  showDetail: boolean;
  fsaFeeObj: AdminFeeDistributionPct;
  facFeeObj: AdminFeeDistributionPct;
  ffcaFeeObj: AdminFeeDistributionPct;
  fsaFee: number;
  facFee: number;
  ffcaFee: number;
  totalAlloc: number;
  newPayment: Payment;
  currentPayment: Payment;
  datePaymentValid: boolean;
  messagePaymentDate: string;
  messageActualDeliveryDate: string;
  actualDeliveryDateValid: Boolean = true;
  readOnly: boolean = true;
  lockedDates: PaymentLock[];
 
  constructor(private poService: PurchaseOrderService, private itemService: ItemService, private toastr: ToastrService,
    private dateFormatPipe: DateFormatPipe, private searchService: SearchService) {
    this.isNew = false;
    this.showDetail = false;
  }



  focusPayment () {

    this.delay(100).then(any => {
      this.paymentFocus.nativeElement.focus();
  });

  }

  newItemPayment () {
    console.log('calling new Payment in payment-detail-component')
    this.paymentForm = this.createFormGroup();
    this.showDetail = true;
    this.isNew = true;

    this.formControlValueChanged();
    this.focusPayment();

    this.datePaymentValid = true;


  }

 

  processPayment () {

    const isValid = this.validateLockDates2();
    const payDate =  this.paymentForm.controls.paymentDate.value
    
    if (!isValid) {
      this.datePaymentValid = false;
      this.paymentForm.controls['paymentDate'].setErrors(payDate, {emitEvent : false});
      this.messagePaymentDate = 'Payment Date must fall outside the locked payment dates ';
      return
    }

    this.copyFormToModel();

    if (this.isNew) {
      this.insertPayment();
    } else {
      this.updatePayment();
    }



  }

  getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  insertPayment() {

    this.currentPayment.createdBy = this.getCurrentUserName();
  //  this.currentPayment.updatedBy = this.getCurrentUserName();

    this.poService.createPayment(this.currentPayment).subscribe(_payment => {
    });

      this.isNew = false;
      this.refreshPaymentList.emit(this.itemId);

     this.toastr.success('Payment Save Successful', 'Payment Insert', {
      timeOut: 2000,
      });

  }

  updatePayment() {

      this.currentPayment.updatedBy = this.getCurrentUserName();

    this.poService.updatePayment(this.currentPayment).subscribe(payment => {
    });


    this.refreshPaymentList.emit(this.itemId);


     this.toastr.success('Payment Save Successful', 'Payment Update', {
      timeOut: 2000,
      });

  }

  initFees() {

    this.itemService.getFee('FSA', this.bidType, this.payCd)
    .subscribe(fsa => {
        this.fsaFeeObj = fsa[0];
        console.log(this.fsaFeeObj);
    });

    this.itemService.getFee('FAC', this.bidType, this.payCd )
    .subscribe(fac => {
        this.facFeeObj = fac[0];
        console.log(this.facFeeObj);
    });

    this.itemService.getFee('FFCA', this.bidType, this.payCd )
    .subscribe(ffca => {
        this.ffcaFeeObj = ffca[0];
        console.log(this.ffcaFeeObj);
    });


  }

  ngOnInit() {

    this.paymentForm = this.createFormGroup();
    this.readOnly = this.poService.isReadOnly();

    this.refreshLockedList();

 /*   this.searchService.getPaymentLockedDates()
    .subscribe(dates => {
      this.lockedDates = dates;
    });  */
  
  }

  refreshLockedList()  {

    this.searchService.getPaymentLockedList().subscribe(_val => {
      this.lockedDates = _val;
    });


  }

  createFormGroup() {

    return new FormGroup({

      id:  new FormControl(),
      fsaCppItemId:  new FormControl(),
      fsaCppPurchaseOrderId: new FormControl(),
      paymentNumber:  new FormControl(),
      paymentDate:  new FormControl('', Validators.required),
      deliveryDate: new FormControl(),
      paymentCheckNumber: new FormControl('', Validators.required),
      paymentAmount: new FormControl('', Validators.required),
      qtyDelivered: new FormControl(),
      correction: new FormControl(),
      auditDifference: new FormControl(),
      fsaAlloc: new FormControl({disabled: true}),
      facAlloc: new FormControl({disabled: true}),
      ffcaAlloc: new FormControl({disabled: true}),
      totalAlloc: new FormControl({disabled: true}),
      fsaRefundAmount: new FormControl(),
      fsaRefundCheckNumber: new FormControl(),
      lateFeeAmount: new FormControl(),
      lateFeeCheckNumber: new FormControl(),
      lateFeeCheckDate: new FormControl(),
      comment: new FormControl()

      });
  }

  copyModelToForm(row) {

     // this.paymentForm = this.createFormGroup();

     this.datePaymentValid = true;

      this.paymentForm.controls['id'].patchValue(row.id, {emitEvent : false});
      this.paymentForm.controls['fsaCppPurchaseOrderId'].patchValue(row.fsaCppPurchaseOrderId, {emitEvent : false});
      this.paymentForm.controls['fsaCppItemId'].patchValue(row.fsaCppItemId, {emitEvent : false});
      this.paymentForm.controls['paymentNumber'].patchValue(row.paymentNumber, {emitEvent : false});
      this.paymentForm.controls['paymentAmount'].patchValue(row.paymentAmount, {emitEvent : false});
      this.paymentForm.controls['paymentDate'].patchValue(this.formatDate(row.paymentDate), {emitEvent : false});
      if (! (row.deliveryDate === undefined || row.deliveryDate === null) ) {
     //   this.paymentForm.controls['lateFeeCheckDate'].patchValue( this.formatDate(row.lateFeeCheckDate), {emitEvent : false}
        this.paymentForm.controls['deliveryDate'].patchValue(this.formatDate(row.deliveryDate), {emitEvent : false});
       }
      this.paymentForm.controls['paymentCheckNumber'].patchValue(row.paymentCheckNum, {emitEvent : false});
      this.paymentForm.controls['qtyDelivered'].patchValue(row.qtyDelivered, {emitEvent : false});
      this.paymentForm.controls['correction'].patchValue(row.correction, {emitEvent : false});
      this.paymentForm.controls['fsaAlloc'].patchValue(row.fsaAlloc, {emitEvent : false});
      this.paymentForm.controls['facAlloc'].patchValue(row.facAlloc, {emitEvent : false});
      this.paymentForm.controls['ffcaAlloc'].patchValue(row.ffcaAlloc, {emitEvent : false});
      this.paymentForm.controls['totalAlloc'].patchValue(row.totalAlloc, {emitEvent : false});
      this.paymentForm.controls['fsaRefundAmount'].patchValue(row.fsaRefundAmount, {emitEvent : false});
      this.paymentForm.controls['fsaRefundCheckNumber'].patchValue(row.fsaRefundCheckNum, {emitEvent : false});
      this.paymentForm.controls['lateFeeAmount'].patchValue(row.lateFeeAmt, {emitEvent : false});
      this.paymentForm.controls['lateFeeCheckNumber'].patchValue(row.lateFeeCheckNum, {emitEvent : false});
      if (! (row.lateFeeCheckDate === undefined || row.lateFeeCheckDate === null) ) {
        this.paymentForm.controls['lateFeeCheckDate'].patchValue( this.formatDate(row.lateFeeCheckDate), {emitEvent : false});
       }

  //    this.paymentForm.controls['lateFeeCheckDate'].patchValue( this.formatDate(row.lateFeeCheckDate), {emitEvent : false});
      this.paymentForm.controls['comment'].patchValue(row.comment, {emitEvent : false});

      this.formControlValueChanged();

    }

    copyFormToModel() {

      this.currentPayment = new Payment();

    //  this.paymentNumber  = (this.isNew ? this.paymentNumber + 1 :  this.paymentNumber);

      if (this.isNew) {
        this.paymentNumber = this.paymentNumber  + 1;
        this.currentPayment.paymentNumber = this.paymentNumber
      }

      this.currentPayment.id = this.paymentForm.controls.id.value;
      this.currentPayment.fsaCppPurchaseOrderId = this.poId;
      this.currentPayment.fsaCppItemId = this.itemId;

      this.currentPayment.paymentAmount = this.paymentForm.controls.paymentAmount.value;
      this.currentPayment.paymentDate =  this.formatDate(this.paymentForm.controls.paymentDate.value);
      this.currentPayment.deliveryDate =  this.paymentForm.controls.deliveryDate.value;
      this.currentPayment.paymentCheckNum = this.paymentForm.controls.paymentCheckNumber.value;
      this.currentPayment.qtyDelivered = this.paymentForm.controls.qtyDelivered.value;
      this.currentPayment.correction = this.paymentForm.controls.correction.value;
      this.currentPayment.fsaAlloc = this.paymentForm.controls.fsaAlloc.value;
      this.currentPayment.facAlloc = this.paymentForm.controls.facAlloc.value;
      this.currentPayment.ffcaAlloc = this.paymentForm.controls.ffcaAlloc.value;
      this.currentPayment.totalAlloc = this.paymentForm.controls.totalAlloc.value;
      this.currentPayment.fsaRefundAmount = this.paymentForm.controls.fsaRefundAmount.value;
      this.currentPayment.lateFeeAmt = this.paymentForm.controls.lateFeeAmount.value;
      this.currentPayment.lateFeeCheckDate = this.paymentForm.controls.lateFeeCheckDate.value;
      this.currentPayment.lateFeeCheckNum = this.paymentForm.controls.lateFeeCheckNumber.value;
      this.currentPayment.comment = this.paymentForm.controls.comment.value;

    }

    formatDate(dateVal: Date) {
      console.log(dateVal);
      const myDate = this.dateFormatPipe.transform(dateVal);
      console.log(myDate);

      moment.locale();         // en
      moment().format('LT');
      const a = moment(dateVal.toLocaleString());
      const b = a.subtract(1, 'hour');
      const myDate2 = this.dateFormatPipe.transform(b);

      return myDate2;

    }

    toPrecision(poAmount: number, places: number) {
      //   const shift = Math.pow(20, places);
         return Number(poAmount.toPrecision(places));
       // return ((poAmount * shift) | 0) / shift;
       };

  truncateDecimals(poAmount: number, places: number) {
 //   const shift = Math.pow(20, places);
    return Number(poAmount.toFixed(places));
  // return ((poAmount * shift) | 0) / shift;
  };

  calculateAdminFee(poAmount: number) {
   return this.truncateDecimals(poAmount * this.adminFeeRate, 2);
  }

  calculateFee(amount: number, fee: number) {
    return this.truncateDecimals(amount * fee, 2);
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log('fired'));
  }

  validateLockDates2() {
   const newDate = new Date(this.paymentForm.controls.paymentDate.value);
   const payDt =  moment(newDate, 'YYYY-MM-DD').startOf('day');
 
   return this.validateLockDates(payDt);
  }

  validateLockDates(paymentDate) {
    const payDate  = moment(paymentDate, 'YYYY-MM-DD').startOf('day');
    let valid: boolean = true;
  
    for (const val of this.lockedDates) {     
      let lockStartDt = moment(val.lockStartDate, 'YYYY-MM-DD').startOf('day');
      let lockEndDt   = moment(val.lockEndDate, 'YYYY-MM-DD').startOf('day');

      if (payDate >= lockStartDt && payDate <= lockEndDt) {
        console.log(` DATE IS WITHIN A LOCKED RANGE of ROWS`)
        valid = false
      }

  }

  return valid;

  }

  formControlValueChanged() {

    this.paymentForm.get('deliveryDate').valueChanges.subscribe(_deliveryDate => {

      const todaysDate = moment();
      let isAfter: boolean;
      let isBefore: boolean;
      const payDate  = moment(_deliveryDate, 'YYYY-MM-DD');

      const poIssueDate = moment(this.formatDate(this.poService.selectedPo.poIssueDate), 'MM/DD/YYYY');
      console.log(poIssueDate);

      if (!(this.paymentForm.controls.deliveryDate.value == null)) {
        isAfter = payDate.isAfter(todaysDate);
        this.paymentForm.controls['deliveryDate'].patchValue(this.formatDate(_deliveryDate), {emitEvent : false});
      }

      if (!(this.paymentForm.controls.deliveryDate.value == null)) {
        isBefore = payDate.isBefore(poIssueDate);
        this.paymentForm.controls['deliveryDate'].patchValue(this.formatDate(_deliveryDate), {emitEvent : false});
      }

      if (isAfter) {
        this.actualDeliveryDateValid = false;
        this.paymentForm.controls['deliveryDate'].setErrors(_deliveryDate, {emitEvent : false});
        this.messageActualDeliveryDate = 'Actual Delivery Date can not be after today ';
      } else if (isBefore) {
        this.actualDeliveryDateValid = false;
        this.paymentForm.controls['deliveryDate'].setErrors(_deliveryDate, {emitEvent : false});
        this.messageActualDeliveryDate = 'Actual Delivery Date cannot be before PO Issue Date ';
      } else {
        this.actualDeliveryDateValid = true;
        this.messageActualDeliveryDate = '';
      }

    });

    this.paymentForm.get('paymentDate').valueChanges.subscribe(_paymentDate => {

      const todaysDate = moment();
      let isAfter: boolean;

      const payDate  = moment(_paymentDate, 'YYYY-MM-DD');

      let isValid: boolean;
      isValid = this.validateLockDates(payDate)

      if (!isValid) {
        this.datePaymentValid = false;
        this.paymentForm.controls['paymentDate'].setErrors(_paymentDate, {emitEvent : false});
        this.messagePaymentDate = 'Payment Date must fall outside the locked payment dates ';
        return
      }  
      

      if (!(this.paymentForm.controls.paymentDate.value == null)) {
        isAfter = payDate.isAfter(todaysDate);
        this.paymentForm.controls['paymentDate'].patchValue(this.formatDate(_paymentDate), {emitEvent : false});
      }

      if (isAfter) {
        this.datePaymentValid = false;
        this.paymentForm.controls['paymentDate'].setErrors(_paymentDate, {emitEvent : false});
        this.messagePaymentDate = 'Payment Date can not be after today ';
      } else {
        this.datePaymentValid = true;
        this.messagePaymentDate = '';
      }

    });

    this.paymentForm.get('paymentAmount').valueChanges.subscribe(_amount => {

      if ( this.ffcaFeeObj  === undefined) {
        this.ffcaFee = 0;
      } else {
        this.ffcaFee = this.ffcaFeeObj.distributionPct;
      }

      if ( this.facFeeObj === undefined) {
        this.facFee = 0;
      } else {
        this.facFee = this.facFeeObj.distributionPct;
      }

      if (this.fsaFeeObj === undefined) {
        this.fsaFee = 0;
      } else {
        this.fsaFee = this.fsaFeeObj.distributionPct;
      }

      const _facFee: number = this.calculateFee(_amount, this.facFee);
      const _ffcaFee: number = this.calculateFee(_amount, this.ffcaFee);
      const _fsaFee: number =  (_amount - (_facFee + _ffcaFee));

    //  const _fsaFee: number = this.toPrecision(this.calculateFee(_amount, this.fsaFee), 2);

      const _totalAlloc: number =  this.truncateDecimals(_fsaFee + _facFee + _ffcaFee, 3);

      console.log('_fsaFee = ' + _fsaFee);
      console.log('_facFee = ' + _facFee);
      console.log('_ffcaFee = ' + _ffcaFee);

      this.paymentForm.controls['fsaAlloc'].patchValue(_fsaFee, {emitEvent : false});
      this.paymentForm.controls['facAlloc'].patchValue(_facFee, {emitEvent : false});
      this.paymentForm.controls['ffcaAlloc'].patchValue(_ffcaFee, {emitEvent : false});
      this.paymentForm.controls['totalAlloc'].patchValue(_totalAlloc, {emitEvent : false});

                    });

  }


}
