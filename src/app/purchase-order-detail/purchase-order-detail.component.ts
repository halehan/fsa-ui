
import { Component, ViewChild, OnInit, AfterViewInit, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PurchaseOrder } from '../model/index';
import { Dealer, CityAgency, BidType, BidNumber, PoStatusType, Specification, Item } from '../model/index';
import { PersonalData } from '../model/contact-request';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { ItemService } from '../services/item.service';
import { ToastrService } from 'ngx-toastr';
import { ItemBidTypeCode } from '../model/itemBidTypeCode';
import { DateFormatPipe } from '../dateFormat/date-format-pipe.pipe';
import { ItemListComponent } from '../item-list/item-list.component';
import { ItemDetailComponent } from '../item-detail/item-detail.component';
import * as moment from 'moment';
import { EventEmitterService } from '../services/event-emitter-service'; 

@Component({
  selector: 'app-purchase-order-detail',
  templateUrl: './purchase-order-detail.component.html',
  styleUrls: ['./purchase-order-detail.component.scss']
})
export class PurchaseOrderDetailComponent implements OnInit, AfterViewInit {

  @Output() refreshPurchaseOrderList: EventEmitter<string> = new EventEmitter();
  @Output() refreshPurchaseOrder: EventEmitter<string> = new EventEmitter();
  @Output() refreshPoDetails: EventEmitter<string> = new EventEmitter();
  @ViewChild('poFocus', {static: true}) poFocus: ElementRef;
  @Input() pox: PurchaseOrder;
  @Input() isNew: Boolean;
  @Input() bidId: string;
  @Input() poId: number;
  @Input() enableItemDetail: boolean;
  @Input() enableItemList: boolean;
  @Input() enablePoDetail: boolean;
  @ViewChild(ItemDetailComponent, {static: true}) itemDetail: ItemDetailComponent;
  @ViewChild(ItemListComponent, {static: true}) itemList: ItemListComponent;

  contactForm: FormGroup;
  cityAgencies: CityAgency[] = [];
  bidTypes: BidType[] = [];
  bidNumbers: BidNumber[] = [];

  dealers: Dealer[] = [];
  newPO: PurchaseOrder;
  currentPO: PurchaseOrder;
  currentAgency: CityAgency;

  enableSpec: Boolean = false;
  enableVehicleType: String = 'disabled';
  specs: Specification[] = [];
  itemTypeCodes: ItemBidTypeCode[] = [];
  savedBid: string;
  poStatusTypeCodes: PoStatusType[] = [];
  // newPoForm: FormGroup; 
  poForm: FormGroup;

  datePoIssueValid: boolean;
  datePoIssueBidValid: boolean;

  datePoReportedBidValid: boolean;
  datePoReportedValid: boolean;

  poIssueDateErrorMsg: string;
  poReportedDateErrorMsg: string;

  currentBid: BidNumber;
  messagePoIssueDate: string;
  messagePoReportedDate: string;
  messagePoAmount: string;

  messagePoFinal: string;
  poFinalValid: boolean;
  enablePoFinal: boolean;
  poFinalDisabled: string;
  poNew: boolean;
  poAmountValid: boolean;
  vendorDebugRowCount: string;
  disablePoAmount: boolean;
  sDisablePOAmount: string;


  readOnly: boolean;

  constructor(private eventEmitterService: EventEmitterService, private poService: PurchaseOrderService, private itemService: ItemService, private toastr: ToastrService,
     private dateFormatPipe: DateFormatPipe) { }

     refreshPoDetail(poId) {
      this.delay(250).then(async any => {
      await this.getPurchaseOrder(poId);  
      });    

     }

     isReadOnly() {
      console.log(this.poService.isReadOnly());
      return this.poService.isReadOnly();
     }
    
     ngOnInit() {

      if (this.eventEmitterService.subscription==undefined) {    
        this.eventEmitterService.subscription = this.eventEmitterService.    
        invokeRefreshPoDetailFunction.subscribe((poId:number) => {    
        this.refreshPoDetail(poId); 
        });    
      }      

      this.poNew = false;
      this.disablePoAmount = false;
      this.sDisablePOAmount = 'false';
      // this.poForm.controls['poAmount'].disable(); 
  
    //  this.getPurchaseOrder(this.poId);
  
      this.poService.getPostatusType()
        .subscribe(codes => {
          this.poStatusTypeCodes = codes;
        });
  
      this.poService.getDealerAssoc(this.bidId)
        .subscribe(_dealers => {
          this.dealers = _dealers;
          this.vendorDebugRowCount = _dealers.length;
        });
  
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
  
      this.getItems(this.poId);
  
      this.poForm = this.createFormGroup();
      this.formControlValueChanged();
  
    }

  focusPoDetail() {

    this.delay(100).then(any => {
      this.poFocus.nativeElement.focus();
    });

  }

  refreshPoDetailsHandler(poId: number) {
    console.log(poId)
    this.refreshPoDetails.emit(poId.toString());

  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log('fired'));
  }

  refreshDetails(poId: number) {
    console.log(poId)
  }

  ngAfterViewInit() {
    console.log('Values on ngAfterViewInit():');
    // console.log('itemList:', this.itemList); 
    console.log('poId', this.poId);
    this.readOnly =  this.poService.isReadOnly();

  }

  getItems(poId: number) {

    this.itemService.getItemByPo(poId)
      .subscribe(items => {
        this.enablePoFinal = (items.length > 0 ? true : false);
        this.poFinalDisabled = (this.enablePoFinal ? 'disabled' : '');
        console.log(this.poFinalDisabled);

      });

  }

  newItem() {
    this.itemList.chain();
  }

  truncateDecimals(poAmount: number, places: number) {
    // const shift = Math.pow(10, places); 
    // const suck = poAmount.toFixed(places); 
    // return ((poAmount * shift) | 0) / shift; 
    return Number(poAmount.toFixed(places));
  };

  calculateAdminFee(poAmount: number) {
    return this.truncateDecimals(poAmount * parseFloat(this.currentBid.AdminFeeRate), 2);
    // return this.truncateDecimals(poAmount * .07, 2); 

  }

  newPo() {
    this.isNew = true;
    this.newPO = new PurchaseOrder();
    this.poForm = this.createFormGroup();

    this.datePoIssueValid = true;
    this.datePoIssueBidValid = true;

    this.datePoReportedBidValid = true;
    this.datePoReportedValid = true;
    this.poFinalValid = true;
    this.poAmountValid = true;
    this.poNew = true;

    this.messagePoFinal = '';

    this.formControlValueChanged();

    this.poService.getAdminFee(this.bidId).subscribe(bid => {
      this.currentBid = bid[0];
      console.log(this.currentBid.AdminFeeRate);
      this.poForm.controls['bidType'].patchValue(this.currentBid.BidType, { emitEvent: false });
    });


    this.poService.getDealerAssoc(this.bidId)
      .subscribe(_dealers => {
        this.dealers = _dealers;
        this.vendorDebugRowCount = _dealers.length;
      });

    this.poForm.controls['bidNumber'].patchValue(this.bidId, { emitEvent: false });
  }

  /* 
  listenForAmountChanges(): void { 
 
    this.poForm.get('poAmount').valueChanges.subscribe( 
      _poAmount => { 
        if (this.valueNotEmpty(_poAmount)) { 
          console.log(this.calculateAdminFee(_poAmount)); 
          this.poForm.patchValue({ 'adminFeeDue': this.calculateAdminFee(_poAmount) }); 
          } 
      }); 
  } 
*/

  private valueNotEmpty(value: string): boolean {
    let rtn: boolean;

    if (value == null || value === undefined) {
      rtn = false;
    } else {
      rtn = true;
    }

    return rtn;

  }


  formControlValueChanged(): void {

    const isPoFinal = this.poForm.controls.poFinal.value;

    this.poForm.get('poAmount').valueChanges.subscribe(
      _poAmount => {
        if (this.valueNotEmpty(_poAmount)) {
       //   console.log(this.calculateAdminFee(_poAmount));
          const fee = this.calculateAdminFee(_poAmount);
          console.log(fee);
          this.poForm.patchValue({ 'adminFeeDue':  fee});
        }
      });

    this.poForm.get('poIssueDate').valueChanges.subscribe(
      _issueDate => {

        const startDate = moment(this.currentBid.StartDate, 'YYYY-MM-DD');
        const endDate = moment(this.currentBid.EndDate, 'YYYY-MM-DD');
        const poIssueDate = moment(_issueDate, 'YYYY-MM-DD');
        const dateReported = moment(this.poForm.controls.dateReported.value, 'MM/DD/YYYY');
        const todaysDate = moment();

        const poIssueDateValid: boolean =
          poIssueDate.isBetween(startDate, endDate, null, '[]');

        let poIssueDateAfterValid: boolean;
        poIssueDateAfterValid = true;
        let isSame: boolean;
        let isAfter: boolean;

        if (!(this.poForm.controls.dateReported.value == null)) {
          poIssueDateAfterValid = poIssueDate.isBefore(dateReported);
          isSame = poIssueDate.isSame(dateReported);
          isAfter = poIssueDate.isAfter(todaysDate);
        }

        console.log('po Issue Date Valid? ', poIssueDateValid);
        console.log('po Issue Date > Reported Date? ', poIssueDateAfterValid);

        this.poForm.controls['poIssueDate'].patchValue(_issueDate, { emitEvent: false });


        if ((poIssueDateAfterValid || isSame) && poIssueDateValid) {
          this.datePoIssueValid = true;
          this.datePoIssueBidValid = true;
          this.poForm.controls['poIssueDate'].setErrors(null, { emitEvent: false });
          this.messagePoIssueDate = '';
        } else if (isAfter) {
          this.datePoIssueValid = false;
          this.poForm.controls['dateReported'].setErrors(_issueDate, { emitEvent: false });
          this.messagePoIssueDate = 'PO Issue Date can not be after today ';
        } else if (!(poIssueDateAfterValid || isSame)) {
          this.datePoIssueValid = false;
          this.poForm.controls['poIssueDate'].setErrors(_issueDate, { emitEvent: false });
          this.messagePoIssueDate = 'PO Issue Date must be before Reported Date ';
        } else {
          this.datePoIssueBidValid = false;
          this.poForm.controls['poIssueDate'].setErrors(_issueDate, { emitEvent: false });
          this.messagePoIssueDate = 'PO Issue Date is not within the date range for the respective bid ';
        }

        return poIssueDateValid && poIssueDateAfterValid ? null : { mismatch: true };
      });

    this.poForm.get('dateReported').valueChanges.subscribe(
      _dateReported => {

        //  const startDate      = moment(this.currentBid.StartDate, 'YYYY-MM-DD'); 
        //  const endDate        = moment(this.currentBid.EndDate, 'YYYY-MM-DD'); 
        const poDateReported = moment(_dateReported, 'YYYY-MM-DD');
        const poIssueDate = moment(this.poForm.controls.poIssueDate.value, 'MM/DD/YYYY');
        const todaysDate = moment();

        //    const poDateReportedDateBidValid: boolean = 
        //      poDateReported.isBetween(startDate, endDate); 

        let poDateReportedDateAfterValid: boolean;
        poDateReportedDateAfterValid = true;
        let isSame: boolean;
        let isAfter: boolean;

        if (!(this.poForm.controls.poIssueDate.value == null)) {
          poDateReportedDateAfterValid = poIssueDate.isBefore(poDateReported) &&
            !(poDateReported.isAfter(todaysDate));
          isSame = poIssueDate.isSame(poDateReported);
          isAfter = poDateReported.isAfter(todaysDate);
        }

        //   console.log('po Issue Date Valid? ', poDateReportedDateBidValid); 

        this.poForm.controls['dateReported'].patchValue(_dateReported, { emitEvent: false });

        if (poDateReportedDateAfterValid || isSame) {
          this.datePoReportedValid = true;
          //    this.datePoReportedBidValid = true; 
          this.poForm.controls['dateReported'].setErrors(null, { emitEvent: false });
          this.messagePoReportedDate = '';
        } else if (isAfter) {
          this.datePoReportedValid = false;
          this.poForm.controls['dateReported'].setErrors(_dateReported, { emitEvent: false });
          this.messagePoReportedDate = 'PO Reported Date can not be after today ';
        } else {
          this.datePoReportedValid = false;
          this.poForm.controls['dateReported'].setErrors(_dateReported, { emitEvent: false });
          this.messagePoReportedDate = 'PO Reported Date must be after PO Issue Date ';
        }


        return poDateReportedDateAfterValid ? null : { mismatch: true };
      });

    this.poForm.get('bidNumber').valueChanges.subscribe(
      _bidNumber => {

        // Need to get list of dealers that are in the DealerBidAssoc 
        this.poService.getDealerAssoc(_bidNumber)
          .subscribe(_dealers => {
            this.dealers = _dealers;
            this.vendorDebugRowCount = _dealers.length;
          });

        this.poService.getAdminFee(_bidNumber).subscribe(bid => {
          this.currentBid = bid[0];
          console.log(this.currentBid.AdminFeeRate);
          this.poForm.controls['bidType'].patchValue(this.currentBid.BidType, { emitEvent: false });
        });

        const startDate = moment(this.currentBid.StartDate, 'YYYY-MM-DD');
        const endDate = moment(this.currentBid.EndDate, 'YYYY-MM-DD');

        console.log('Start Date', startDate);
        console.log('Start Date', endDate);

      });


    this.poForm.get('poFinal').valueChanges.subscribe(
      _poFinal => {
        console.log('poFinal changed and the value is now ' + _poFinal);

        if (_poFinal) {
          const poAmount: number = Number(this.poForm.controls.poAmount.value);
          let itemSum: number;
          this.poService.setEnableItemSection(false);
          this.poForm.controls['poAmount'].disable();
          this.disablePoAmount = true;
          this.sDisablePOAmount = 'true';

          this.itemService.getItemAmountByPoId(this.poId).subscribe(_amt => {

            try {
              itemSum = Number(_amt[0].amt);
            } catch {
              itemSum = 0;
            }

            console.log('Item Amount = ', itemSum);

            if (!(poAmount === itemSum)) {
              this.poFinalValid = false;
              this.poForm.setErrors({ 'invalid': true });
              if (itemSum === 0) {
                this.messagePoFinal = 'PO has no associated Items. PO must contain an Item.';
              } else {
                this.messagePoFinal = 'PO and Item amounts do not match';
              }
              this.poForm.controls['poFinal'].setErrors(_poFinal, { emitEvent: false });

            } else {
              this.messagePoFinal = '';
              this.poFinalValid = true;
              this.poForm.controls['poAmount'].disable();
              //    this.poService.setEnableItemSection(true); 
              //     this.poForm.setErrors({ invalid: false }); 
            }

          });


          console.log('itemSum = ' + itemSum);

          console.log('Kick off Po Final validation');

          console.log('poAmount ', poAmount);
        } else {
          this.messagePoFinal = '';
          this.poFinalValid = true;
          this.poForm.controls['poAmount'].enable();
          this.poService.setEnableItemSection(true);
        }
        //  return this.poFinalValid ? null : { mismatch: true }; 

      });

    this.poForm.get('cityAgency').valueChanges.subscribe(
      _cityAgency => {
        this.poService.getPayCode(_cityAgency).subscribe(cd => {
          this.poForm.controls['payCd'].patchValue(cd[0].agencyPayCode, { emitEvent: false });
        });
      });

  }

  getSuck() {
    return this.enableVehicleType;
  }

  formatDate(dateVal: Date) {
    console.log(dateVal);
    const myDate = this.dateFormatPipe.transform(dateVal);
    console.log(myDate);

    moment.locale();         // en 
    moment().format('LT');
    const a = moment(dateVal.toLocaleString());
    const b = a.add(8, 'hour');
    const myDate2 = this.dateFormatPipe.transform(b);

    return myDate2;

  }


  copyModelToForm() {

    if (this.currentPO != null) {

      this.poService.getAdminFee(this.bidId).subscribe(bid => {
        this.currentBid = bid[0];
        console.log(this.currentBid.AdminFeeRate);
        this.poForm.controls['bidType'].patchValue(this.currentBid.BidType, { emitEvent: false });
      });

      this.poService.getDealerAssoc(this.currentPO.bidNumber)
        .subscribe(_dealers => {
          this.dealers = _dealers;
          this.vendorDebugRowCount = _dealers.length;
        });

      this.poService.getCityAgencyByName(this.currentPO.cityAgency)
        .subscribe(agency => {
          this.currentAgency = agency[0];
          console.log(this.currentAgency.state);
          this.poService.currentAgency = this.currentAgency;
        });

      this.datePoIssueValid = true;
      this.datePoIssueBidValid = true;

      this.datePoReportedBidValid = true;
      this.datePoReportedValid = true;
      this.poFinalValid = true;
      this.poAmountValid = true;

      this.messagePoFinal = '';

      if (this.currentPO.poFinal === 1) {
        this.poForm.controls['poAmount'].disable();
      } else {
        this.poForm.controls['poAmount'].enable();
      }

      this.poService.getAdminFee(this.currentPO.bidNumber).subscribe(bid => {
        this.currentBid = bid[0];
        this.currentPO.bidType = this.currentBid.BidType;
      });

      const fname: string = this.currentPO.dealerName;
      console.log(fname);
      let dateReported: Date;
      let poIssueDate: Date;
      dateReported = null;
      poIssueDate = null;

      let dealerFlag: boolean;
      let agencyFlag: boolean;

      dealerFlag = (this.currentPO.dealerFlag === '1') ? true : false;
      agencyFlag = (this.currentPO.agencyFlag === '1') ? true : false;


      this.poForm.controls['bidNumber'].patchValue(this.currentPO.bidNumber, { emitEvent: false });
      // this.poForm.controls['bidtype'].patchValue(this.currentPO.bidType, {emitEvent : false}); 
      this.poForm.controls['poNumber'].patchValue(this.currentPO.poNumber, { emitEvent: false });

      if (!(this.currentPO.poIssueDate === null || this.currentPO.poIssueDate === undefined)) {
        poIssueDate = this.formatDate(this.currentPO.poIssueDate);
      }

      if (!(this.currentPO.dateReported === null || this.currentPO.dateReported === undefined)) {
        dateReported = this.formatDate(this.currentPO.dateReported);
      }

      this.poForm.controls['poIssueDate'].patchValue(poIssueDate, { emitEvent: false });
      this.poForm.controls['dateReported'].patchValue(dateReported, { emitEvent: false });
      this.poForm.controls['estimatedDelivery'].patchValue(this.currentPO.estimatedDelivery, { emitEvent: false });
      this.poForm.controls['cityAgency'].patchValue(this.currentPO.cityAgency, { emitEvent: false });
      this.poForm.controls['dealerName'].patchValue(this.currentPO.dealerName, { emitEvent: false });
      this.poForm.controls['agencyFlag'].patchValue(agencyFlag, { emitEvent: false });
      this.poForm.controls['dealerFlag'].patchValue(dealerFlag, { emitEvent: false });
      this.poForm.controls['poStatus'].patchValue(this.currentPO.poStatus, { emitEvent: false });
      this.poForm.controls['poFinal'].patchValue(this.currentPO.poFinal, { emitEvent: false });
      this.poForm.controls['qty'].patchValue(this.currentPO.qty, { emitEvent: false });
      this.poForm.controls['poAmount'].patchValue(this.currentPO.poAmount, { emitEvent: false });
      this.poForm.controls['actualPo'].patchValue(this.currentPO.actualPo, { emitEvent: false });
      this.poForm.controls['adminFeeDue'].patchValue(this.currentPO.adminFeeDue, { emitEvent: false });
      this.poForm.controls['comments'].patchValue(this.currentPO.comments, { emitEvent: false });
      this.poForm.controls['payCd'].patchValue(this.currentPO.payCd, { emitEvent: false });

      if (this.currentPO.poFinal) {
        this.poService.enableItemSection = false;
      } else {
        this.poService.enableItemSection = true;
      }

    }

  }

  createFormGroup() {

    return new FormGroup({

      bidNumber: new FormControl('', Validators.required),
      poNumber: new FormControl('', Validators.required),
      poIssueDate: new FormControl(),
      dateReported: new FormControl(),
      estimatedDelivery: new FormControl(),
      cityAgency: new FormControl('', Validators.required),
      dealerName: new FormControl('', Validators.required),
      //    spec: new FormControl('', Validators.required), 
      //    vehicleType: new FormControl('', Validators.required), 
      agencyFlag: new FormControl(false),
      bidType: new FormControl(),
      dealerFlag: new FormControl(false),
      poStatus: new FormControl('No'),
      poFinal: new FormControl(),
      qty: new FormControl(),
      poAmount: new FormControl(),
      //  poAmount: new FormControl('', Validators.required), 
      actualPo: new FormControl(),
      adminFeeDue: new FormControl({ disabled: true }),
      comments: new FormControl(),
      payCd: new FormControl()
    });
  }

  copyFormToNewModel() {

    let dealerFlag: string;
    let agencyFlag: string;

    let dealerBool: boolean;
    let agencyBool: boolean;

    dealerBool = this.poForm.controls.dealerFlag.value;
    agencyBool = this.poForm.controls.agencyFlag.value;

    console.log('dealerBool = ' + dealerBool);
    console.log('agencyBool = ' + agencyBool);

    dealerFlag = this.poForm.controls.dealerFlag.value;
    agencyFlag = this.poForm.controls.agencyFlag.value;

    dealerFlag = (this.poForm.controls.dealerFlag.value) ? '1' : '0';
    agencyFlag = (this.poForm.controls.agencyFlag.value) ? '1' : '0';

    console.log('dealerFlag = ' + dealerFlag);
    console.log('agencyFlag = ' + agencyFlag);

    this.newPO.bidNumber = this.poForm.controls.bidNumber.value;

    this.newPO.bidType = this.poForm.controls.bidType.value;
    this.newPO.poNumber = this.poForm.controls.poNumber.value;
    this.newPO.poIssueDate = this.poForm.controls.poIssueDate.value;
    this.newPO.dateReported = this.poForm.controls.dateReported.value;
    this.newPO.estimatedDelivery = this.poForm.controls.estimatedDelivery.value;
    this.newPO.cityAgency = this.poForm.controls.cityAgency.value;
    this.newPO.dealerName = this.poForm.controls.dealerName.value;

    this.newPO.agencyFlag = agencyFlag;
    this.newPO.dealerFlag = dealerFlag;
    this.newPO.poStatus = this.poForm.controls.poStatus.value;
    this.newPO.poAmount = this.poForm.controls.poAmount.value;

    this.newPO.adminFeeDue = this.poForm.controls.adminFeeDue.value;
    this.newPO.comments = this.poForm.controls.comments.value;
    this.newPO.payCd = this.poForm.controls.payCd.value;

    this.isNew = true;

  }

  copyFormToModel() {

    let dateReported: Date;
    let poIssueDate: Date;
    dateReported = null;
    poIssueDate = null

    let dealerFlag: string;
    let agencyFlag: string;

    dealerFlag = (this.poForm.controls.dealerFlag.value) ? '1' : '0';
    agencyFlag = (this.poForm.controls.agencyFlag.value) ? '1' : '0';

    this.currentPO.bidNumber = this.poForm.controls.bidNumber.value;
    this.currentPO.bidType = this.poForm.controls.bidType.value;
    this.currentPO.poNumber = this.poForm.controls.poNumber.value;

    if (!(this.poForm.controls.poIssueDate.value === null || this.poForm.controls.poIssueDate.value === undefined)) {
      poIssueDate = this.formatDate(this.poForm.controls.poIssueDate.value);
    }

    this.currentPO.poIssueDate = poIssueDate;

    if (!(this.poForm.controls.dateReported.value === null || this.poForm.controls.dateReported.value === undefined)) {
      dateReported = this.formatDate(this.poForm.controls.dateReported.value);
    }

    this.currentPO.dateReported = dateReported;
    this.currentPO.poIssueDate = poIssueDate;

    this.currentPO.cityAgency = this.poForm.controls.cityAgency.value;
    this.currentPO.dealerName = this.poForm.controls.dealerName.value;

    this.currentPO.agencyFlag = agencyFlag;
    this.currentPO.dealerFlag = dealerFlag;
    this.currentPO.poStatus = this.poForm.controls.poStatus.value;
    this.currentPO.poAmount = this.poForm.controls.poAmount.value;

    this.currentPO.adminFeeDue = this.poForm.controls.adminFeeDue.value;
    this.currentPO.comments = this.poForm.controls.comments.value;
    this.currentPO.payCd = this.poForm.controls.payCd.value;
    this.currentPO.poFinal = this.poForm.controls.poFinal.value;


  }

  revert() {
    // Resets to blank object 
    this.contactForm.reset();

    // Resets to provided model 
    this.contactForm.reset({ personalData: new PersonalData(), requestType: '', text: '' });
  }


  getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  refreshItemListHandler(bidId: string) {
    console.log('Called refreshItemListHandler');

  }

  insertPo() {

    this.newPO.createdBy = this.getCurrentUserName();
    this.newPO.updatedBy = this.getCurrentUserName();
    let transId: number;

    this.isNew = false;
    // this.enableItemList = true; 

    this.poService.createPurchaseOrder(this.newPO).subscribe(async po => {
      console.log(po);
      transId = po.id;
     await this.getPurchaseOrder(transId);
    });

    this.refreshPurchaseOrderList.emit(this.newPO.bidNumber);

    this.toastr.success('Purchase Order Insert Successful', 'Purchase Insert', {
      timeOut: 2000,
    });

    this._markFormPristine(this.poForm);

    // HACK 
    this.datePoIssueValid = true;
    this.datePoIssueBidValid = true;
    this.datePoReportedValid = true;
    this.datePoReportedBidValid = true;
    this.poAmountValid = true;

    this.refreshPoDetailsHandler(transId)

  }

  private _markFormPristine(form: FormGroup): void {
    Object.keys(form.controls).forEach(control => {
      form.controls[control].markAsPristine();
    });
  }

  updatePo() {

    const isPoFinal = this.poForm.controls.poFinal.value;
    const poAmount: number = Number(this.poForm.controls.poAmount.value);

    let itemSum: number;
    itemSum = 0;
    if (isPoFinal) {
      this.itemService.getItemAmountByPoId(this.poId).subscribe(_amt => {

        try {
          itemSum = Number(_amt[0].amt);
        } catch { }

        console.log('Item Amount = ', _amt[0].amt);

        if (!(poAmount === itemSum)) {
          this.poFinalValid = false;
          this.poForm.setErrors({ 'invalid': true });
          if (itemSum === 0) {
            this.messagePoFinal = 'PO has no associated Items. PO must contain an Item.';
          } else {
            this.messagePoFinal = 'PO and Item amounts do not match';
          }
          this.datePoIssueValid = true;
          //   this.datePoIssueBidValid = true; 
          //  this.datePoReportedValid = true; 
          //   this.datePoReportedBidValid = true; 
          //    this.poAmountValid = true; 
          return this.poFinalValid ? null : { mismatch: true };
        } else {
          this.messagePoFinal = '';
          this.poFinalValid = true;
        }

        this.currentPO.updatedBy = this.getCurrentUserName();

        this.poService.updatePurchaseOrder(this.currentPO).subscribe(po => {
        });


        this.refreshPurchaseOrderList.emit(this.currentPO.bidNumber);

        this.toastr.success('Purchase Order Save Successful', 'Purchase Update', {
          timeOut: 2000,
        });

        console.log(this.poForm.pristine.valueOf());

        this._markFormPristine(this.poForm);

      });

    } else {

      /* 
  * 
  */

      this.currentPO.updatedBy = this.getCurrentUserName();

      this.poService.updatePurchaseOrder(this.currentPO).subscribe(po => {
      });


      this.refreshPurchaseOrderList.emit(this.currentPO.bidNumber);

      this.toastr.success('Purchase Order Save Successful', 'Purchase Update', {
        timeOut: 2000,
      });

      console.log(this.poForm.pristine.valueOf());

      this._markFormPristine(this.poForm);

      console.log(this.poForm.pristine.valueOf());

      // HACK 
      this.datePoIssueValid = true;
      this.datePoIssueBidValid = true;
      this.datePoReportedValid = true;
      this.datePoReportedBidValid = true;
      this.poAmountValid = true;

    }

  }

  processPurchaseOrder() {

    // Determine if the action is an update or insert of the PO. 

    if (this.poForm.invalid) {
      this.datePoIssueValid = true;
      return;
    } else {
      //    this.datePoIssueValid = false; 

      if (this.isNew) {
        this.copyFormToNewModel();
        this.insertPo();
      } else {
        this.copyFormToModel();
        this.updatePo();
      }


    }

  }

  refreshPoDetailHandler(poId: number) {
    this.getPurchaseOrder(poId);
  }

  getPurchaseOrder2() {

    this.currentPO = this.pox;
    this.copyModelToForm();

  }



  async getPurchaseOrder(id: number)  {

  await this.poService.getPoById(id)
      .subscribe(po => {
        this.currentPO = po[0]; 
        this.copyModelToForm();
      });



  }



}


