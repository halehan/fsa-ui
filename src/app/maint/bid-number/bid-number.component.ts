import { ChangeDetectorRef, Component, Input, ViewChild, OnInit, AfterViewInit, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { MaintService } from '../../services/maint.service';
import { BidNumber } from '../../model/bidNumber';
import { DateFormatPipe } from '../../dateFormat/date-format-pipe.pipe';
import * as moment from 'moment';

@Component({
  selector: 'app-bid-number',
  templateUrl: './bid-number.component.html',
  styleUrls: ['./bid-number.component.scss']
})
export class BidNumberComponent implements OnInit, AfterViewInit {

  form: FormGroup;


  selectedItem: BidNumber;
  selectedItemDetail: BidNumber;
  rowSelected: boolean;
  enableDetail: boolean;
  isNew: boolean;
  isAdmin: boolean;


  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  listDS = new MatTableDataSource();
  itemColumns = ['BidNumber', 'BidType', 'BidTitle', 'AdminFeeRate', 'StartDate', 'EndDate',
                  'edit'];

  constructor(private changeDetectorRef: ChangeDetectorRef, private maintService: MaintService, private dateFormatPipe: DateFormatPipe, 
    private toastr: ToastrService, private fb: FormBuilder) { }


  ngOnInit() {

    this.refreshList('list');

    this.form = this.createFormGroup();

    this.isAdmin = (localStorage.getItem('isAdmin') === 'True');
    console.log('isAdmin ' + this.isAdmin)
  }

  ngAfterViewInit() {

    this.listDS.sort = this.sort;
    this.listDS.paginator = this.paginator;

  }

  applyUserFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.listDS.filter = filterValue;
  }

  createFormGroup() {
    /*
        BidNumber: string;
        BidType: string;
        BidTitle: string;
        AdminFeeRate: string;
        StartDate: Date;
        EndDate: Date;
        EstimatedCloseoutDate: Date;
        ClosedoutDate: Date;
    */
    return new FormGroup({

      id: new FormControl(''),
      BidNumber: new FormControl('', Validators.required),
      BidType: new FormControl(),
      BidTitle: new FormControl(),
      AdminFeeRate: new FormControl(),
      StartDate: new FormControl(),
      EndDate: new FormControl(),
    });
  }

  copyModelToForm(row) {

    this.form = this.createFormGroup();

    this.form.controls['id'].patchValue(row.id, { emitEvent: false });
    this.form.controls['BidNumber'].patchValue(row.BidNumber, { emitEvent: true, disabled: true });
    this.form.controls['BidType'].patchValue(row.BidType, { emitEvent: false });
    this.form.controls['BidTitle'].patchValue(row.BidTitle, { emitEvent: false });
    this.form.controls['AdminFeeRate'].patchValue(row.AdminFeeRate, { emitEvent: false });
    this.form.controls['StartDate'].patchValue(this.formatDate(row.StartDate), { emitEvent: false, disabled: true});

   if (!(row.EndDate === undefined || row.EndDate === null)) {
      this.form.controls['EndDate'].patchValue(this.formatDate(row.EndDate), { emitEvent: false });
    } else {
      this.form.controls['EndDate'].patchValue(row.EndDate, { emitEvent: false });
    }

 /*   if (!(row.ClosedoutDate === undefined || row.ClosedoutDate === null)) {
      this.form.controls['ClosedoutDate'].patchValue(this.formatDate(row.ClosedoutDate), { emitEvent: false });
    } else {
      this.form.controls['ClosedoutDate'].patchValue(row.ClosedoutDate, { emitEvent: false });
    }

    if (!(row.EstimatedCloseoutDate === undefined || row.EstimatedCloseoutDate === null)) {
      this.form.controls['EstimatedCloseoutDate'].patchValue(this.formatDate(row.EstimatedCloseoutDate), { emitEvent: false });
    } else {
      this.form.controls['EstimatedCloseoutDate'].patchValue(row.EstimatedCloseoutDate, { emitEvent: false });
    }
*/

  }

  copyFormToModel(form): BidNumber {

    let model: BidNumber;

    model = new BidNumber();

    let startDate: Date;
    let endDate: Date;
    let closedoutDate: Date;
    let estimatedCloseoutDate: Date;

    startDate = null;
    endDate = null;
    estimatedCloseoutDate = null;
    closedoutDate = null;

    model.id = form.controls.id.value;
    model.BidNumber = form.controls.BidNumber.value;
    model.BidType = form.controls.BidType.value;
    model.BidTitle = form.controls.BidTitle.value;
    model.AdminFeeRate = form.controls.AdminFeeRate.value;


    if (!(form.controls.StartDate.value === null || form.controls.StartDate.value === undefined)) {
      startDate = this.formatDate(form.controls.StartDate.value);
    }


    if (!(form.controls.EndDate.value === null || form.controls.EndDate.value === undefined)) {
      endDate = this.formatDate(form.controls.EndDate.value);
    }

 /*   if (!(form.controls.EstimatedCloseoutDate.value === null || form.controls.EstimatedCloseoutDate.value === undefined)) {
      estimatedCloseoutDate = this.formatDate(form.controls.EstimatedCloseoutDate.value);
    }

    if (!(form.controls.ClosedoutDate.value === null || form.controls.ClosedoutDate.value === undefined)) {
      closedoutDate = this.formatDate(form.controls.ClosedoutDate.value);
    } */

    model.StartDate = startDate;
    model.EndDate = endDate;
 //   model.ClosedoutDate = closedoutDate;
//    model.EstimatedCloseoutDate = estimatedCloseoutDate;

    return model;

  }

  disableElements(): void {

    this.changeDetectorRef.detectChanges();

    this.form.controls['BidNumber'].disable();
    this.form.controls['BidType'].disable();

  }


  enableElements(): void {

    this.changeDetectorRef.detectChanges();

    this.form.controls['BidNumber'].enable();
    this.form.controls['BidType'].enable();

  }
  getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  new() {
    this.form = this.createFormGroup();

    this.enableDetail = true;
    this.isNew = true;
    this.enableElements();
  }

  onSelect(item: BidNumber): void {

    this.selectedItem = item;

    this.enableDetail = true;

    this.setItemListRowSelected(true);
    this.copyModelToForm(item);
    this.isNew = false;

    this.disableElements();

  }

  setItemListRowSelected(val: boolean) {
    this.rowSelected = val;
  }

  refreshList(sort: string): void {

    this.maintService.getAllBids().subscribe(_val => {
      this.listDS.data = _val;
    });

  }

  processDetailUpdate() {

    // Determine if the action is an update or insert of the PO. 

    if (this.isNew) {
      let fee: BidNumber;
      fee = this.copyFormToModel(this.form);
      this.insert(fee);

    } else {
      let fee: BidNumber;
      fee = this.copyFormToModel(this.form);
      this.update(fee);
    }

    this.isNew = false;

  }

  update(val: BidNumber) {

    val.updatedBy = this.getCurrentUserName();

     this.maintService.updateBid(val).subscribe(_fee => {
       });
    this.toastr.success('Contract Save Successful', 'Contract Update', {
      timeOut: 2000,
    });
    this.refreshList('update');

  }


  insert(val: BidNumber)  {

    val.createdBy = this.getCurrentUserName();

    this.maintService.insertBid(val).subscribe(_fee =>  {
      if (_fee) {
        this.toastr.success('Contract Insert Successful', 'Contract Insert', {
          timeOut: 2000,
        });
        this.refreshList('insert');
      }

    });

  }

  delete(row) {
  
    if (confirm('Are you sure you want to delete Contract?  ' + row.BidNumber)) {

      row.updatedBy = this.getCurrentUserName();

      this.maintService.deleteBid(row.id).subscribe(async po => {
        if (po) {
          this.toastr.success('Contract delete Successful', 'Contract Delete', {
            timeOut: 2000,
          });
          this.refreshList('list');
        }

      });

    }
  
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

 
}