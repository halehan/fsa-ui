import { Component, ViewChild, OnInit, AfterViewInit, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { MaintService } from '../../services/maint.service';
import { CityAgency, AgencyType } from '../../model/index';
import { DateFormatPipe } from '../../dateFormat/date-format-pipe.pipe';
import * as moment from 'moment';

@Component({
  selector: 'app-city-agency',
  templateUrl: './city-agency.component.html',
  styleUrls: ['./city-agency.component.scss']
})
export class CityAgencyComponent implements OnInit, AfterViewInit {

  cityAgency: CityAgency[] = [];
  states: String[] = [];
  counties: String[] = [];
  cityAgencyForm: FormGroup;
  agencytypeCodes: AgencyType[] = [];


  selectedItem: CityAgency;
  selectedItemDetail: CityAgency;
  rowSelected: boolean;
  enableDetail: boolean;
  isNew: boolean;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  listDS = new MatTableDataSource();
  itemColumns = ['cityAgencyName', 'agencyName', 'cityAgencyAddress', 'state', 'county',
    'contact', 'phone', 'edit', 'delete'];

  constructor(private maintService: MaintService, private dateFormatPipe: DateFormatPipe,
    private toastr: ToastrService, private fb: FormBuilder) { }


  ngOnInit() {

    this.refreshList();

    this.cityAgencyForm = this.createFormGroup();
    this.changes();

    this.getStates();
    this.getCounties('FL');

    this.maintService.getAgencyType()
    .subscribe(codes => {
      this.agencytypeCodes = codes;
    });


  }

  ngAfterViewInit() {

    this.listDS.sort = this.sort;
    this.listDS.paginator = this.paginator;

  }

  changes(): void {

    this.cityAgencyForm.get('cityAgencyState').valueChanges.subscribe(
      _state => {
        console.log(_state);
        this.getCounties(_state);
      });

  }

  applyUserFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.listDS.filter = filterValue;
  }

  createFormGroup() {

    return new FormGroup({

      id: new FormControl(''),
      cityAgencyName: new FormControl('', Validators.required),
      agencyTypeId: new FormControl('', Validators.required),
      cityAgencyAddress: new FormControl(),
      cityAgencyCounty: new FormControl('', Validators.required),
      cityAgencyState: new FormControl('', Validators.required),
      cityAgencyContact: new FormControl(),
      cityAgencyContactPhone: new FormControl()
    });
  }

  copyModelToForm(row) {

    console.log(row.cityAgencyName);
    console.log(row.agencyTypeId);
    console.log(row.cityAgencyAddress);
    console.log(row.cityAgencyCounty);
    console.log(row.cityAgencyState);
    console.log(row.cityAgencyContact);
    console.log(row.cityAgencyContactPhone);


    this.cityAgencyForm.controls['id'].patchValue(row.id, { emitEvent: false });
    this.cityAgencyForm.controls['cityAgencyName'].patchValue(row.cityAgencyName, { emitEvent: false });
    this.cityAgencyForm.controls['agencyTypeId'].patchValue(row.agencyTypeId, { emitEvent: false });

    //  if (!(row.cityAgencyAddress === null) ) {
    this.cityAgencyForm.controls['cityAgencyAddress'].patchValue(row.cityAgencyAddress, { emitEvent: false });
    //   }

    //  if (!(row.cityAgencyCounty === null) ) {
    this.cityAgencyForm.controls['cityAgencyCounty'].patchValue(row.cityAgencyCounty, { emitEvent: false });
    //   }

    this.cityAgencyForm.controls['cityAgencyState'].patchValue(row.cityAgencyState, { emitEvent: false });

    //  if (!(row.cityAgencyContact === null)) {
    this.cityAgencyForm.controls['cityAgencyContact'].patchValue(row.cityAgencyContact, { emitEvent: false });
    //  }

    //   if (!(row.cityAgencyContactPhone === null)) {
    this.cityAgencyForm.controls['cityAgencyContactPhone'].patchValue(row.cityAgencyContactPhone, { emitEvent: false });
    //  }

  }

  copyFormToModel(cityAgencyForm): CityAgency {

    let cityAgency: CityAgency;

    cityAgency = new CityAgency();

    cityAgency.id = cityAgencyForm.controls.id.value;
    cityAgency.cityAgencyName = cityAgencyForm.controls.cityAgencyName.value;
    cityAgency.cityAgencyAddress = cityAgencyForm.controls.cityAgencyAddress.value;
    cityAgency.agencyTypeId = cityAgencyForm.controls.agencyTypeId.value;
    cityAgency.cityAgencyCounty = cityAgencyForm.controls.cityAgencyCounty.value;
    cityAgency.cityAgencyState = cityAgencyForm.controls.cityAgencyState.value;
    cityAgency.cityAgencyContact = cityAgencyForm.controls.cityAgencyContact.value;
    cityAgency.cityAgencyContactPhone = cityAgencyForm.controls.cityAgencyContactPhone.value;

    return cityAgency;

  }

  getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  newCityAgency() {
    this.cityAgencyForm = this.createFormGroup();

    this.enableDetail = true;
    this.isNew = true;
  }

  onSelect(item: CityAgency): void {

    this.selectedItem = item;
    //   this.getCounties(item.cityAgencyState);
    this.enableDetail = true;

    this.setItemListRowSelected(true);
    this.copyModelToForm(item);
    this.isNew = false;

  }

  setItemListRowSelected(val: boolean) {
    this.rowSelected = val;
  }

  async refreshList()  {
    this.delay(550).then(any => {
    this.maintService.getAllCityAgency().subscribe(_fees => {
      if (_fees) {
        this.listDS.data = _fees;
      }
    });
  });

  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log('fired'));
  }

  getStates() {

    this.maintService.getAllStates().subscribe(_states => {
      this.states = _states;
    });

  }

  getCounties(state: string): void {

    this.maintService.getCounties(state).subscribe(_counties => {
      this.counties = _counties;
    });

  }


  async insert(val: CityAgency) {
    val.createdBy = this.getCurrentUserName();

    this.maintService.insertCityAgency(val).subscribe(_fee => {
      if (_fee) {
        this.toastr.success('Agency Insert Successful', 'Agency Insert', {
          timeOut: 2000,
        });
        this.refreshList();
      }

    });

  }


  processDetailUpdate() {

    // Determine if the action is an update or insert of the PO. 

    if (this.isNew) {
      let fee: CityAgency;
      fee = this.copyFormToModel(this.cityAgencyForm);
      this.insert(fee);

    } else {
      let fee: CityAgency;
      fee = this.copyFormToModel(this.cityAgencyForm);
      this.update(fee);
    }

  }

  new(): void {

    this.cityAgencyForm = this.createFormGroup();

    this.enableDetail = true;
    this.isNew = true;

    this.changes();

  }

  update(val: CityAgency) {

    val.updatedBy = this.getCurrentUserName();

    this.maintService.updateCityAgency(val).subscribe(_fee => {
      if (_fee) {
        this.refreshList();
        this.toastr.success('Agency Save Successful', 'Agency Update', {
          timeOut: 2000,
        });
        this.isNew = false;
      }
    });

  }


  async deleteItem(row: any) {

    if (confirm('Are you sure you want to delete Item ? ' + row.id + '  ' + row.itemDescription)) {

      const promise = this.maintService.deleteAgency(row.id).toPromise();
      promise.then(async (data) => {

        this.enableDetail = false;
        

        console.log('Promise resolved with: ' + JSON.stringify(data));
        console.log(data);
        this.toastr.success('Agency Fee delete Successful', 'Purchase Delete', {
          timeOut: 2000,
        });
        await this.refreshList();
      }, (error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      })

    }

  }

  async deleteAgency(row) {

    if (confirm('Are you sure you want delete Agency?  ' + row.cityAgencyName)) {

      this.maintService.deleteAgency(row.id).subscribe(async _fee => {
        if (_fee) {
          this.toastr.success('Agency Delete Successful', 'Agency Delete', {
            timeOut: 2000,
          });
          this.refreshList();
        }
  
      });
    }
  }
}
