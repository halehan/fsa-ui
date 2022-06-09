import { Component, Input, ViewChild, OnInit, AfterViewInit,  ElementRef, Output,  EventEmitter} from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {MatPaginator, MatTableDataSource , MatSort} from '@angular/material';
import { PurchaseOrder, Dealer, CityAgency, BidType, Payment, BidNumber,
  ItemBidTypeCode, PoStatusType, Specification, AgencyType } from '../model/index';
import { DateFormatPipe } from '../dateFormat/date-format-pipe.pipe';
import { PurchaseOrderService } from '../services/purchase-order.service';

@Component({
  selector: 'app-item-payment',
  templateUrl: './item-payment.component.html',
  styleUrls: ['./item-payment.component.scss']
})
export class ItemPaymentComponent implements OnInit {

  paymentForm: FormGroup;
  selectedPayment: Payment;
  showPayment: Boolean = false;
  showNewPayment: Boolean = false;
  fuck: Boolean = false;
  paymentDataSource = new MatTableDataSource();
  paymentColumns = ['paymentDate', 'paymentAmount', 'paymentNumber', 'paymentCheckNum', 'edit', 'delete'];

  @Input() po: PurchaseOrder;
  @Output() rowChanged: EventEmitter<null> = new EventEmitter();

  constructor(private dateFormatPipe: DateFormatPipe, private poService: PurchaseOrderService) { }

  ngOnInit() {
    this.paymentForm = this.createPaymentFormGroup();
 //   console.log(this.po.id);
 //   this.getPayment(this.po.id);
  }


  isReadOnly() {
    return this.poService.isReadOnly();
   }
   
  createPaymentFormGroup() {

    return new FormGroup({

        paymentDate:  new FormControl('', Validators.required),
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

  validatePaymentFormDates(g: FormGroup) {

    return {mismatch: false};

  }

  onSelectPayment(payment: Payment) {
    this.selectedPayment = payment;
    this.showPayment = true;
    this.fuck = false;

    this.selectedPayment.paymentDate = this.formatDate(this.selectedPayment.paymentDate);
    this.selectedPayment.lateFeeCheckDate = this.formatDate(this.selectedPayment.lateFeeCheckDate);
    this.selectedPayment.fsaRefundDate = this.formatDate(this.selectedPayment.fsaRefundDate);

   // this.copyPaymentModelToForm();

   }

   formatDate(dateVal: Date) {
    console.log(dateVal);
    const myDate = this.dateFormatPipe.transform(dateVal);
    console.log(myDate);
    return myDate;

  }

  getPayment(id: number) {

    this.poService.getPayment(id)
    .subscribe(payment => {
        this.selectedPayment = payment;
        this.paymentDataSource.data = payment;

    });
  }

}
