import { ChangeDetectorRef, Component, Input, ViewChild, OnInit, AfterViewInit, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { MaintService } from '../../services/maint.service';
import { ItemBidTypeCode } from '../../model/itemBidTypeCode';
import { BidNumber } from '../../model/bidNumber';
import { DateFormatPipe } from '../../dateFormat/date-format-pipe.pipe';
import * as moment from 'moment';

@Component({
  selector: 'app-bid-item-codes',
  templateUrl: './bid-item-codes.component.html',
  styleUrls: ['./bid-item-codes.component.scss']
})
export class BidItemCodesComponent implements OnInit , AfterViewInit {

  _form: FormGroup;

  selectedItem: ItemBidTypeCode;
  selectedItemDetail: ItemBidTypeCode;
  rowSelected: boolean;
  enableDetail: boolean;
  isNew: boolean;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  id: number;
  bidNumber: string;
  bidItemCodeId: number;
  itemNumber: number;
  itemMake: string;
  itemType: string;
  itemModelNumber: string;
  itemDescription: string;
  updatedBy: string;
  createdBy: string;
  bids: BidNumber [] = [];

  ContractItemlistDS = new MatTableDataSource();
  itemColumns = ['bidNumber',  'itemNumber', 'itemType', 'itemMake', 'itemDescription',  'itemModelNumber',   
                   'edit', 'delete'];

  constructor(private changeDetectorRef: ChangeDetectorRef, private maintService: MaintService, private dateFormatPipe: DateFormatPipe, 
    private toastr: ToastrService, private fb: FormBuilder) { }

  ngOnInit() {

      this.ContractItemlistDS.filterPredicate = function(data: ItemBidTypeCode, filter: string): boolean {
        const bidNumber = (data.bidNumber === undefined || data.bidNumber === null || data.bidNumber.length === 0) ? '' : data.bidNumber.toLowerCase()
        const itemModelNumber = (data.itemModelNumber === undefined || data.itemModelNumber === null || data.itemModelNumber.length === 0) ? '' : data.itemModelNumber.toLowerCase()
        const itemDescription = (data.itemDescription === undefined || data.itemDescription === null || data.itemDescription.length === 0) ? '' : data.itemDescription.toLowerCase()
        const itemType = (data.itemType === undefined || data.itemType === null || data.itemType.length === 0) ? '' : data.itemType.toLowerCase()
        const itemNumber = (data.itemNumber === undefined || data.itemNumber === null || data.itemNumber.toString().length === 0) ? '' : data.itemNumber
    
        return bidNumber.includes(filter) || itemModelNumber.includes(filter) || itemDescription.includes(filter) 
              || itemType.includes(filter) || itemNumber.toString().includes(filter)
       
      };

      this._form = this.createFormGroup();
   
  }

  ngAfterViewInit() {

    this.refreshList();

    this.ContractItemlistDS.sort = this.sort;
    this.ContractItemlistDS.paginator = this.paginator;
    this.getBids();

  }

  applyUserFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    console.log(filterValue)
    this.ContractItemlistDS.filter = filterValue;
    let len = this.ContractItemlistDS.filteredData.length
    console.log(len)
  }

  createFormGroup() {

    /*
    id: number;
    bidNumber: string;
    bidItemCodeId: number;
    itemNumber: number;
    itemMake: string;
    itemType: string;
    itemModelNumber: string;
    itemDescription: string;
    updatedBy: string;
    createdBy: string;
    */

    return new FormGroup({

      id: new FormControl(''),
      bidNumber: new FormControl('', Validators.required),
    //  bidItemCodeId: new FormControl('', Validators.required),
      itemNumber: new FormControl('', Validators.required),
      itemMake: new FormControl('', Validators.required),
      itemType: new FormControl('', Validators.required),
      itemModelNumber: new FormControl('', Validators.required),
      itemDescription: new FormControl('', Validators.required),

    });
  }

  copyModelToForm(row) {

    this._form = this.createFormGroup();

    this._form.controls['id'].patchValue(row.id, { emitEvent: false });
    this._form.controls['bidNumber'].patchValue(row.bidNumber, { emitEvent: true, disabled: true });
    this._form.controls['itemMake'].patchValue(row.itemMake, { emitEvent: false });
    this._form.controls['itemType'].patchValue(row.itemType, { emitEvent: false });
    this._form.controls['itemModelNumber'].patchValue(row.itemModelNumber, { emitEvent: false });
    this._form.controls['itemDescription'].patchValue(row.itemDescription, { emitEvent: false, disabled: true});
    this._form.controls['itemNumber'].patchValue(row.itemNumber, { emitEvent: false });
  }

  copyFormToModel(_form): ItemBidTypeCode {

    let model: ItemBidTypeCode;

    model = new ItemBidTypeCode();

    model.id = _form.controls.id.value;
    model.bidNumber = _form.controls.bidNumber.value;
    model.itemNumber = _form.controls.itemNumber.value;
    model.itemMake = _form.controls.itemMake.value;
    model.itemType = _form.controls.itemType.value;
    model.itemModelNumber = _form.controls.itemModelNumber.value;
    model.itemDescription = _form.controls.itemDescription.value;


    return model;

  }

  getBids() {

    this.maintService.getAllBids()
      .subscribe(_bids => {
        this.bids = _bids;
        console.log(this.bids);
      });

  }

  disableElements(): void {

    this.changeDetectorRef.detectChanges();

    this._form.controls['bidNumber'].disable();
    this._form.controls['itemNumber'].disable();

  }


  enableElements(): void {

    this.changeDetectorRef.detectChanges();

    this._form.controls['bidNumber'].enable();
    this._form.controls['itemNumber'].enable();

  }
  getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  new() {
    this._form = this.createFormGroup();

    this.enableDetail = true;
    this.isNew = true;
    this.enableElements();
  }

  onSelect(item: ItemBidTypeCode): void {

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


  async refreshList() {

  //  this.delay(550).then(any => {
    this.maintService.getAllItems().subscribe(_val => {
      if (_val) {
        this.ContractItemlistDS.data = _val;
      }
    });
 // });

  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log('fired'));
  }

  processDetailUpdate() {

    // Determine if the action is an update or insert of the PO.

    if (this.isNew) {
      let fee: ItemBidTypeCode;
      fee = this.copyFormToModel(this._form);
      this.insert(fee);

    } else {
      let fee: ItemBidTypeCode;
      fee = this.copyFormToModel(this._form);
      this.update(fee);
    }

    this.isNew = false;

  }

  update(val: ItemBidTypeCode) {

    val.updatedBy = this.getCurrentUserName();

     this.maintService.updateItemBid(val).subscribe(_fee => {
       });
    this.toastr.success('Save Successful', 'Contract Item Update', {
      timeOut: 2000,
    });
    this.refreshList();

  }


  insert(val: ItemBidTypeCode) {
    val.createdBy = this.getCurrentUserName();

    this.maintService.insertBidItem(val).subscribe(_fee => {
      if (_fee) {
        this.toastr.success('Insert Successful', 'Contract Item Insert', {
          timeOut: 2500,
        });
        this.refreshList();
      }

    });

  }

  async deleteContractItem(row) {

    if (confirm('Are you sure you want to delete Contract Item?  ' + row.bidNumber + " - " + row.itemDescription)) {

      this.maintService.deleteBiditem(row.id).subscribe(async _fee => {
        if (_fee) {
          this.enableDetail = false;
          this.toastr.success('Contract Item Delete Successful', 'Contract Item Delete', {
            timeOut: 2000,
          });
          this.refreshList();
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
    const _date = this.dateFormatPipe.transform(b);

    return _date;

  }

 
}