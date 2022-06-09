import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { VendorFine, VendorFinePayment, Dealer, BidNumber, PurchaseOrder } from '../model/index';
import { ToastrService } from 'ngx-toastr';
import { DateFormatPipe } from '../dateFormat/date-format-pipe.pipe';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { VendorFineService } from '../services/vendorFine.service';
import { PurchaseOrderService } from '../services/purchase-order.service';

@Component({
  selector: 'app-vendor-fine',
  templateUrl: './vendor-fine.component.html',
  styleUrls: ['./vendor-fine.component.scss']
})
export class VendorFineComponent implements OnInit, AfterViewInit {

  vendors: VendorFine[] = [];
  dealers: Dealer[] = [];
  bids: BidNumber[] = [];
  validPos: PurchaseOrder[] = [];
  enableList: Boolean = false;
  enablePaymentList: Boolean = false;
  enablePaymentDetail: Boolean = false;
  isPaymentNew: Boolean = false;
  enableDetail: Boolean = false;
  fineNew: Boolean = false;
  isNew: Boolean = false;
  isPoQtr: Boolean = false;
  dataSource = new MatTableDataSource();
  finePaymentListDS = new MatTableDataSource();;
  receiveDateValid: boolean;
  checkErrorMessage: string;
  receiveErroMessage: string;
  vendorId: number;
  currentVendorFineId: number;
  currentVendorPaymentId: number;
  currentVendorFineObject: VendorFine

  displayedColumns = ['dealerName', 'status', 'reason', 'bidNumber', 'amount', 'paymentAmount', 'balance', 'edit', 'delete'];
  paymentColumns = ['checkNumber', 'paymentDate', 'paymentAmount', 'comments', 'edit', 'delete'];

  enableFeeDetail: Boolean = false;
  vendorForm: FormGroup;
  paymentForm: FormGroup;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private vendorFineService: VendorFineService, private fb: FormBuilder,
    private dateFormatPipe: DateFormatPipe, private toastr: ToastrService, private poService: PurchaseOrderService,) { }

  isEmpty(val: string): boolean {

    if ((val === undefined || val === null || val.length === 0)) {
      return true;
    } else {
      return false;
    }

  }


  ngOnInit() {

    this.getAllVendorFines();
    this.getAllVendors();
    this.getAllBids();

    this.vendorForm = this.createFormGroup();
    this.paymentForm = this.createPaymentFormGroup();
   
  }

  ngAfterViewInit() {

    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

  }


  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log('fired'));
  }

  applyUserFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }


  refreshList() {

    this.delay(1000).then(any => {
      this.vendorFineService.getVendorFines()
        .subscribe(_vendors => {
          this.vendors = _vendors;
          this.enableList = (_vendors.length > 0 ? true : false);
          this.dataSource.data = _vendors;
        });

    });

  }

  async refreshPaymentList() {

    this.delay(1000).then(any => {
      this.vendorFineService.getVendorFinePaymentsByVendor(this.currentVendorFineId)
        .subscribe(_payments => {
          this.finePaymentListDS.data = _payments;
          this.enablePaymentList = (_payments.length > 0 ? true : false);
        });
    });

  }

   onChanges()  {

    this.vendorForm.get('poNumber').valueChanges.subscribe(poNumber => {
      console.log(` poNumber ${poNumber}   `);
    });

    this.vendorForm.get('dealerId').valueChanges.subscribe(dealerId => {
      console.log(` dealerId ${dealerId}   `);
      console.log(` vendorForm ${this.vendorForm.get('dealerId')}`);
    });

    this.vendorForm.get('quarter').valueChanges.subscribe(quarter => {
      console.log(` quarter ${quarter}  `);
     
    });

    this.vendorForm.get('contractNumber').valueChanges.subscribe(contractNumber => {
      console.log(` contractNumber ${contractNumber}  `);
  
          // Need to get list of dealers that are in the DealerBidAssoc 
          this.poService.getDealerAssoc(contractNumber)
            .subscribe(_dealers => {
              this.dealers = _dealers;
           
   });
 
  });

}

  getAllVendorFines() {

    this.vendorFineService.getVendorFines()
      .subscribe(_vendors => {
        this.vendors = _vendors;
        this.enableList = (_vendors.length > 0 ? true : false);
        this.dataSource.data = _vendors;
      });

   

  }

   async getVendorFine(id: number) {

    this.vendorFineService.getVendorFineByVendor(id)
      .subscribe(vendor => {
        this.copyModelToForm(vendor);
      });

  }

  getAllVendors() {

    this.vendorFineService.getAllDealers()
      .subscribe(_dealers => {
        this.dealers = _dealers;
      });

  }

  getAllBids() {
    this.vendorFineService.getAllBids()
      .subscribe(_bids => {
        this.bids = _bids;
      });
  }

  newFine() {
    this.vendorForm = this.createFormGroup();
    this.isNew = true;
    this.enableDetail = true;
    this.enablePaymentDetail = false;
    this.enablePaymentList = false;
    this.onChanges()

  }

  editFine(fine: VendorFine) {

    (async () => {
      this.getVendorFine(fine.id)
    })();

   // this.selectedVendor = fine;
    this.enablePaymentDetail = false;
    this.enableDetail = true;
    this.isNew = false;
    this.currentVendorFineId = fine.id;
    // this.copyModelToForm(fine);
    this.getPaymentList(fine.id)
   
  }

  editPayment(payment: VendorFinePayment) {

    this.enablePaymentDetail = true;
    this.isPaymentNew = false;
    this.currentVendorFineId = payment.vendorFineId;
    this.currentVendorPaymentId = payment.id;

    console.log(` payment: ${JSON.stringify(payment)} `)
    this.copyPaymentModelToForm(payment);

  }

  createPayment() {

    this.paymentForm = this.createPaymentFormGroup();
    this.isPaymentNew = true;
    this.enablePaymentDetail = true;

  }

  getPaymentList(id: number) {

    this.vendorFineService.getVendorFinePaymentsByVendor(id)
      .subscribe(_payments => {
        this.finePaymentListDS.data = _payments;
        this.enablePaymentList = (_payments.length > 0 ? true : false);
      });

    console.log(`  id: ${id} `)
  }

  getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  processDetailUpdate() {

    // Determine if the action is an update or insert of the Fine. 

    const poNumberControl = this.vendorForm.get('poNumber').value;
    const quarterControl = this.vendorForm.get('quarter').value;

    if (this.isEmpty(poNumberControl) && this.isEmpty(quarterControl) ) {
      this.isPoQtr = true;
      return

    }

    if (this.isNew) {
      let fine: VendorFine;
      fine = this.copyFormToModel(this.vendorForm);
      fine.createdBy = this.getCurrentUserName();
      this.insertFine(fine);
      this.isPaymentNew = false;
      this.isNew = false;

    } else {
      let fine: VendorFine;
      fine = this.copyFormToModel(this.vendorForm);
      fine.updatedBy = this.getCurrentUserName();
      fine.id = this.currentVendorFineId;
      this.updateFine(fine);
    }

    this.isPoQtr = false;

    this.refreshList();

  }

  processPaymentDetailUpdate() {

    // Determine if the action is an update or insert of the PO. 

    if (this.isPaymentNew) {
      let payment: VendorFinePayment;
      payment = this.copyPaymentFormToModel(this.paymentForm)
      payment.vendorFineId = this.currentVendorFineId
      payment.createdBy = this.getCurrentUserName();
      this.insertPayment(payment);
      this.isPaymentNew = false;

    } else {
      let payment: VendorFinePayment;
      payment = this.copyPaymentFormToModel(this.paymentForm);
      payment.updatedBy = this.getCurrentUserName();
      this.updatePayment(payment);
    }

    // Refresh list to reflect balance
    this.refreshList();
    this.refreshPaymentList();

  }


  updateFine(fine: VendorFine) {
    this.vendorFineService.update(fine).subscribe(payment => {
    });

    this.toastr.success('Vendor Fee Save Successful', 'Fee Update', {
      timeOut: 2000,
    });

  }


  async insertFine(fine: VendorFine) {

    (await this.vendorFineService.insert(fine)).subscribe(payment => {
      this.currentVendorFineId = payment.id
      console.log(` payment1: ${payment[0].id} `)

    });

    this.toastr.success('Vendor Fee Insert Successful', 'Fee Insert', {
      timeOut: 2000,
    });
  }

  updatePayment(payment: VendorFinePayment) {

    this.vendorFineService.updatePayment(payment).subscribe(payment => {
    });

    this.toastr.success('Vendor Fee Payment Save Successful', 'Fee Update', {
      timeOut: 2000,
    });

  }


  insertPayment(payment: VendorFinePayment) {

    this.vendorFineService.insertPayment(payment).subscribe(rtn => {
    });

    this.toastr.success('Vendor Fee Payment Insert Successful', 'Fee Insert', {
      timeOut: 2000,
    });
  }

  deleteFine(fine: VendorFine) {

    if (confirm('Are you sure you want delete Vendor Fine?  ' + fine.dealerName + ' - ' + fine.reason)) {

      this.vendorFineService.delete(fine.id).subscribe(payment => {
      });

      this.toastr.success('Vendor Fine', 'Fine Deleted', {
        timeOut: 2000,
      });

      this.refreshList();
      this.refreshPaymentList();

    }

  }

  async deletePayment(payment: VendorFinePayment) {

    if (confirm(`Are you sure you want delete Vendor Fine Payment? ${payment.checkNumber} ${payment.paymentAmount} ${payment.paymentDate} `)) {

      this.vendorFineService.delete(payment.id).subscribe(payment => {
      });

      this.toastr.success('Vendor Fine Payment Delete Successful', 'Fine Payment Delete', {
        timeOut: 2000,
      });

      await this.refreshPaymentList();

    }

  }

  async deleteFinePayment(payment: VendorFinePayment) {

    if (confirm(`Are you sure you want delete Vendor Fine Payment? ${payment.checkNumber} ${payment.paymentAmount} ${payment.paymentDate} `)) {

      this.vendorFineService.deleteFinePayment(payment.id).subscribe(payment => {
      });

      this.toastr.success('Vendor Fine Payment Delete Successful', 'Fine Payment Delete', {
        timeOut: 2000,
      });

      await this.refreshPaymentList();
      this.refreshList();

    }

  }


  createFormGroup() {

    return new FormGroup({

      id: new FormControl(),
      dealerId: new FormControl(),
      dealerName: new FormControl(),
      reason: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
      contractNumber: new FormControl('', Validators.required),
      poNumber: new FormControl(),
      quarter: new FormControl(),
      comments: new FormControl(),
      fineAmount: new FormControl()
    });

  }

  createPaymentFormGroup() {

    return new FormGroup({

      id: new FormControl(''),
      vendorFineId: new FormControl(''),
      checkNumber: new FormControl('', Validators.required),
      paymentDate: new FormControl('', Validators.required),
      paymentAmount: new FormControl('', Validators.required),
      comments: new FormControl()
    });

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

  copyPaymentModelToForm(row) {

    this.paymentForm.controls['id'].patchValue(row.id, { emitEvent: false });
    this.paymentForm.controls['vendorFineId'].patchValue(row.vendorFineId, { emitEvent: false });
    this.paymentForm.controls['comments'].patchValue(row.comments, { emitEvent: false });
    this.paymentForm.controls['checkNumber'].patchValue(row.checkNumber, { emitEvent: false });
    this.paymentForm.controls['comments'].patchValue(row.comments, { emitEvent: false });
    this.paymentForm.controls['paymentAmount'].patchValue(row.paymentAmount, { emitEvent: false });

    if (!(row.paymentDate === undefined || row.paymentDate === null)) {
      this.paymentForm.controls['paymentDate'].patchValue(this.formatDate(row.paymentDate), { emitEvent: false });
    }

  }

  copyPaymentFormToModel(vendorForm): VendorFinePayment {

    let receiveDate: Date;

    const vendorFinePayment: VendorFinePayment = new VendorFinePayment();

    vendorFinePayment.id = vendorForm.controls.id.value;
    vendorFinePayment.vendorFineId = vendorForm.controls.vendorFineId.value;
    vendorFinePayment.checkNumber = vendorForm.controls.checkNumber.value;
    vendorFinePayment.paymentAmount = vendorForm.controls.paymentAmount.value;
    vendorFinePayment.comments = vendorForm.controls.comments.value;

    if (!(vendorForm.controls.paymentDate.value === null || vendorForm.controls.paymentDate.value === undefined)) {
      receiveDate = this.formatDate(vendorForm.controls.paymentDate.value);
    }

    vendorFinePayment.paymentDate = receiveDate;

    return vendorFinePayment;

  }

  copyModelToForm(row) {

    this.vendorForm.controls['id'].patchValue(row[0].id, { emitEvent: false });
    this.vendorForm.controls['dealerId'].patchValue(row[0].dealerId, { emitEvent: false });
    this.vendorForm.controls['reason'].patchValue(row[0].reason, { emitEvent: false });
    this.vendorForm.controls['status'].patchValue(row[0].status, { emitEvent: false });
    this.vendorForm.controls['poNumber'].patchValue(row[0].poNumber, { emitEvent: false });
    this.vendorForm.controls['quarter'].patchValue(row[0].quarter, { emitEvent: false });
    this.vendorForm.controls['contractNumber'].patchValue(row[0].contractNumber, { emitEvent: false });

    this.vendorForm.controls['comments'].patchValue(row[0].comments, { emitEvent: false });
    this.vendorForm.controls['fineAmount'].patchValue(row[0].fineAmount, { emitEvent: false });

    /*
      if (! (row.paymentDate === undefined || row.paymentDate === null) ) {
        this.vendorForm.controls['paymentDate'].patchValue(this.formatDate(row.paymentDate), {emitEvent : false});
      }  */

    this.receiveDateValid = true;

    this.onChanges();

  }

  copyFormToModel(vendorForm): VendorFine {

    let receiveDate: Date;

    const fee: VendorFine = new VendorFine();

    fee.id = vendorForm.controls.id.value;
    fee.contractNumber = vendorForm.controls.contractNumber.value;
    fee.dealerId = vendorForm.controls.dealerId.value;
    fee.fineAmount = vendorForm.controls.fineAmount.value;
    fee.reason = vendorForm.controls.reason.value;
    fee.status = vendorForm.controls.status.value;
    fee.comments = vendorForm.controls.comments.value;
    fee.poNumber = vendorForm.controls.poNumber.value;
    fee.quarter = vendorForm.controls.quarter.value;

    /*
    if (!(vendorForm.controls.paymentDate.value === null || vendorForm.controls.paymentDate.value === undefined)) {
      receiveDate = this.formatDate(vendorForm.controls.paymentDate.value);
    }
  
    fee.paymentDate = receiveDate; */

    return fee;

  }



}
