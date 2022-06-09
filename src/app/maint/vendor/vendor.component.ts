import { Component, Input, ViewChild, OnInit, AfterViewInit, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { MaintService } from '../../services/maint.service';
import { Dealer } from '../../model/dealer';
import { DateFormatPipe } from '../../dateFormat/date-format-pipe.pipe';
import * as moment from 'moment';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})
export class VendorComponent implements OnInit, AfterViewInit{

  dealershipCodes: Dealer[] = [];
  dealerForm: FormGroup;


  selectedItem: Dealer;
  selectedItemDetail: Dealer;
  rowSelected: boolean;
  enableDetail: boolean;
  isNew: boolean;


  @ViewChild(MatSort,      {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  Id: string;
  dealerName: string;
  active: string;
  updatedBy: string;
  createdBy: string;

  listDS = new MatTableDataSource();
  listAssocDS = new MatTableDataSource();
  listAvailDS = new MatTableDataSource();
  itemColumns = ['dealerName',  'edit', 'delete'];
  assocColumns = ['bidNumber',  'action'];

  constructor(private maintService: MaintService, private dateFormatPipe: DateFormatPipe, private toastr: ToastrService) { }


  ngOnInit() {

    this.refreshList('list');

    this.dealerForm = this.createFormGroup();
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

    return new FormGroup({

      id: new FormControl(''),
      dealerName: new FormControl('', Validators.required),
      active: new FormControl()
    });
  }

  copyModelToForm(row) {

    this.dealerForm = this.createFormGroup();

    this.dealerForm.controls['id'].patchValue(row.Id, { emitEvent: false });
    this.dealerForm.controls['dealerName'].patchValue(row.dealerName, { emitEvent: false });
    this.dealerForm.controls['active'].patchValue(row.active, { emitEvent: false });

  }

  copyFormToModel(form): Dealer {

    let dealer: Dealer;

    dealer = new Dealer();

    dealer.Id = form.controls.id.value;
    dealer.dealerName = form.controls.dealerName.value;
    dealer.active = form.controls.active.value;

    return dealer;

  }

  getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  newDealer() {
    this.dealerForm = this.createFormGroup();

    this.enableDetail = true;
    this.isNew = true;

    this.listAssocDS = null;
    this.listAvailDS = null;
  }

  addContract() {

  }

  async  removeContract(row: any) {

      if (confirm('Are you sure you want to remove Contract ' + row.bidNumber + 'from Vendor ' + row.dealerName)) {

        console.log(JSON.stringify(row));
  
        this.maintService.deleteVendorAssocBid(row.Id).subscribe(async _fee => {
          if (_fee) {
        //    this.enableDetail = false;
            this.toastr.success('Contract Delete Successful', 'Contract Delete', {
              timeOut: 2000,
            });
            await this.refreshList('list');
          }
    
        });  
  
      }

  }

  async onSelect(item: Dealer): Promise<void> {

    await  this.maintService.getBidsByDealer(item.dealerName).subscribe(_val => {
     this.listAssocDS =  _val;
    });

    await  this.maintService.getAvailableBidsByDealer(item.dealerName).subscribe(_val => {
      this.listAvailDS =  _val;
     });
    
    this.selectedItem = item;

    this.enableDetail = true;

    this.setItemListRowSelected(true);
    this.copyModelToForm(item);
    this.isNew = false;

  }

  setItemListRowSelected(val: boolean) {
    this.rowSelected = val;
  }

  async refreshList(sort: string)  {

    await this.maintService.getAllVendors(sort).subscribe(_val => {
      this.listDS.data = _val;
    });

  }

  async refreshAssocList(dealerName: string)  {

    await  this.maintService.getBidsByDealer(dealerName).subscribe(_val => {
      this.listAssocDS =  _val;
     });
 
    await  this.maintService.getAvailableBidsByDealer(dealerName).subscribe(_val => {
       this.listAvailDS =  _val;
      });

  }

  processDetailUpdate() {

    // Determine if the action is an update or insert of the PO. 

    if (this.isNew) {
      let fee: Dealer;
      fee = this.copyFormToModel(this.dealerForm);
      this.insert(fee);

    } else {
      let fee: Dealer;
      fee = this.copyFormToModel(this.dealerForm);
      this.update(fee);
    }

    this.isNew = false;

  }

  async update(val: Dealer) {

    val.updatedBy = this.getCurrentUserName();

    await this.maintService.updateVendor(val).subscribe(_fee => {
    });
    this.toastr.success('Vendor Save Successful', 'Vendor Update', {
      timeOut: 2000,
    });
    await this.refreshList('update');
    await this. refreshAssocList(val.dealerName)

  }


  async insert(val: Dealer) {
    val.createdBy = this.getCurrentUserName();

   await this.maintService.insertVendor(val).subscribe(_fee => {
    });

    this.toastr.success('Vendor Insert Successful', 'Vendor Insert', {
      timeOut: 2000,
    });
   await this.refreshList('insert');

  }

  async addContractAssoc(row: any) {

    row.createdBy = await this.getCurrentUserName();
    row.dealerName = this.selectedItem.dealerName;

   await this.maintService.insertVendorAssocBid(row).subscribe(_fee => {
    });

    this.toastr.success('Contract Association Successful', 'Contract Association Insert', {
      timeOut: 2000,
    });
   await this.refreshAssocList(row.dealerName);

  }

  async deleteContractAssoc(row: any) {

    if (confirm('Are you sure you want to remove Vendor ' + row.dealerName + ' Contract ' + row.bidNumber  )) {

      this.maintService.deleteVendorAssocBid(row.id).subscribe(async _fee => {
        if (_fee) {
     //     this.enableDetail = false;
          this.toastr.success('Contract removal Successful', 'Contract removal', {
            timeOut: 2000,
          });
          await this.refreshAssocList(row.dealerName);
        }
  
      });

    }

  }

  async deleteDealer(row: any) {

    let message;
    let contracts = [];

   await  this.maintService.getBidsByDealer(row.dealerName).subscribe(_val => {
     contracts =  _val;
     });
     

     if (contracts && contracts.length > 0) { 
       alert('You must first remove associated contracts. ')
      
      } else {

  
    if (confirm('Are you sure you want to delete Vendor?  ' + row.dealerName)) {

      this.maintService.deleteVendor(row.Id).subscribe(async _fee => {
        if (_fee) {
          this.enableDetail = false;
          this.toastr.success('Vendor Delete Successful', 'Vendor Delete', {
            timeOut: 2000,
          });
          await this.refreshList('list');
        }
  
      });

    }

  }

  }

}