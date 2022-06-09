import { ChangeDetectorRef, Component, Input, ViewChild, OnInit, AfterViewInit, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { MaintService } from '../../services/maint.service';
import { AdminFeeDistributionPct, AgencyType } from '../../model/index';
import { DateFormatPipe } from '../../dateFormat/date-format-pipe.pipe';
import * as moment from 'moment';


@Component({
  selector: 'app-admin-fee-dist',
  templateUrl: './admin-fee-dist.component.html',
  styleUrls: ['./admin-fee-dist.component.scss']
})
export class AdminFeeDistComponent implements OnInit, AfterViewInit {

  fees: AdminFeeDistributionPct[] = [];
  _form: FormGroup;

  payeePartner: string;
  bidType: string;
  payCd: string;
  distributionPct: number;
  agencytypeCodes: AgencyType[] = [];

  selectedItem: AdminFeeDistributionPct;
  selectedItemDetail: AdminFeeDistributionPct;
  rowSelected: boolean;
  enableFeeDetail: boolean;
  isNew: boolean;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;


  feeListDS = new MatTableDataSource();
  itemColumns = ['payeePartner', 'bidType', 'payCd', 'distributionPct', 'effectiveDate', 'retiredDate', 'edit', 'delete'];

  constructor(private changeDetectorRef: ChangeDetectorRef, private maintService: MaintService, private dateFormatPipe: DateFormatPipe,
     private toastr: ToastrService) { }

  ngOnInit() {

   this.refreshList();

   this._form =  this.createFormGroup();
   this.changes();

   this.maintService.getAgencyType()
   .subscribe(codes => {
     this.agencytypeCodes = codes;
   });

  }

  ngAfterViewInit() {

    this.feeListDS.sort = this.sort;
    this.feeListDS.paginator = this.paginator;

  }

  applyUserFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.feeListDS.filter = filterValue;
  }

  refreshList(): void {

    this.maintService.getFee().subscribe(_fees => {
      this.feeListDS.data = _fees;
    });

  }

  changes(): void {

    this._form.get('bidType').valueChanges.subscribe(
      _bidType => {
        console.log(_bidType);
      });

      this._form.get('payCd').valueChanges.subscribe(
        _payCd => {
          console.log(_payCd);
        });


  }

  disableElements(): void {

    this.changeDetectorRef.detectChanges();

    this._form.controls['payeePartner'].disable();
 //   this._form.controls['bidType'].disable();

  }


  enableElements(): void {

    this.changeDetectorRef.detectChanges();

    this._form.controls['payeePartner'].enable();
    this._form.controls['bidType'].enable();

  }


  createFormGroup() {

    return new FormGroup({

      id: new FormControl(''),
      payeePartner:  new FormControl('', Validators.required),
      bidType:  new FormControl('', Validators.required),
      payCd: new FormControl('', Validators.required),
      distributionPct: new FormControl('', Validators.required),
      effectiveDate: new FormControl(),
      retiredDate:  new FormControl()
    });


  }

  setItemListRowSelected(val: boolean) {
    this.rowSelected = val;
  }


  onSelect(item: AdminFeeDistributionPct): void {

      this.selectedItem = item;

      this.enableFeeDetail = true;

      this.setItemListRowSelected(true);
      this.copyModelToForm(item);
      this.isNew = false;

      this.disableElements();


 //     this.itemDetail.focusItem();
    }

/*
  getFeeDetails (id: Number): void {

      this.maintService.getFeeById(id).subscribe(item => {
      this.selectedItemDetail = item[0];
      this.enableFeeDetail = (item.length > 0 ? true : false);
    });

  }
*/
  newAdminFee() {
    this._form = this.createFormGroup();

    this.enableFeeDetail = true;
    this.isNew = true;

    this.enableElements();
  }

  copyModelToForm(row) {

   //  this._form = this.createFormGroup();

     this._form.controls['id'].patchValue(row.id, {emitEvent : false});
     this._form.controls['payeePartner'].patchValue(row.payeePartner, {emitEvent : false});
     this._form.controls['bidType'].patchValue(row.bidType, {emitEvent : false});
     this._form.controls['payCd'].patchValue(row.payCD.trim(), {emitEvent : false});
     this._form.controls['distributionPct'].patchValue(row.distributionPct, {emitEvent : false});
     this._form.controls['effectiveDate'].patchValue(this.formatDate(row.effectiveDate), {emitEvent : false});
     if (! (row.retiredDate === undefined || row.retiredDate === null) ) {
       this._form.controls['retiredDate'].patchValue(this.formatDate(row.retiredDate), {emitEvent : false});
     }

    // this._form.controls['bidType'].disable();
    // this._form.controls['payeePartner'].disable();
    // this._form.controls['payCd'].disable();

    }

    copyFormToModel(_form): AdminFeeDistributionPct {

    let effectiveDate: Date;
    let retiredDate: Date;
    let fee: AdminFeeDistributionPct;

    fee = new AdminFeeDistributionPct();

    fee.id = _form.controls.id.value;
    fee.payeePartner = _form.controls.payeePartner.value;
    fee.bidType = _form.controls.bidType.value;
    fee.distributionPct = _form.controls.distributionPct.value;
    fee.payCd = _form.controls.payCd.value;
    fee.payeePartner = _form.controls.payeePartner.value;


    if (!(_form.controls.effectiveDate.value === null || _form.controls.effectiveDate.value === undefined)) {
      effectiveDate = this.formatDate(_form.controls.effectiveDate.value);
    }


    if (!(_form.controls.retiredDate.value === null || _form.controls.retiredDate.value === undefined)) {
      retiredDate = this.formatDate(_form.controls.retiredDate.value);
    }

    fee.effectiveDate = effectiveDate;
    fee.retiredDate = retiredDate;

    return fee;

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

  processDetailUpdate() {

     // Determine if the action is an update or insert of the PO. 

      if (this.isNew) {
        let fee: AdminFeeDistributionPct;
        fee = this.copyFormToModel(this._form);
        this.insert(fee);

      } else {
        let fee: AdminFeeDistributionPct;
        fee = this.copyFormToModel(this._form);
        this.update(fee);
      }

  }

  getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  insert(fee: AdminFeeDistributionPct) {

    fee.createdBy = this.getCurrentUserName();

    this.maintService.insertAdminFee(fee).subscribe(_fee => {
      if (_fee) {
        this.toastr.success('Partner Distribution Save Successful', 'Partner Distribution Insert', {
          timeOut: 2000,
        });
        this.refreshList();
      }

    });

  }

  update(fee: AdminFeeDistributionPct) {

    fee.updatedBy = this.getCurrentUserName();

    this.maintService.updateAdminFee(fee).subscribe(_fee => {
    });
    this.toastr.success('Partner Distribution Save Successful', 'Partner Distribution Update', {
      timeOut: 2000,
    });
    this.refreshList();

}

  deleteAdminFee(row) {

    if (confirm('Are you sure you want to delete Partner Distribution?  ' + row.payeePartner + ' - ' + row.bidType)) {

      row.updatedBy = this.getCurrentUserName();


      this.maintService.deleteAdminFee(row.id).subscribe(async po => {
        if (po) {
          this.toastr.success('Partner Distribution delete Successful', 'Partner Distribution Delete', {
            timeOut: 2000,
          });
          this.refreshList();
        }

      });

    }

  }

}
