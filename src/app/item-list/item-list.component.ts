import { Component, Input, ViewChild, OnInit, AfterViewInit, ElementRef, Output, EventEmitter, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import {
  PurchaseOrder, Dealer, CityAgency, BidType, Payment, BidNumber,
  ItemBidTypeCode, PoStatusType, Specification, AgencyType, Item
} from '../model/index';
import { ToastrService } from 'ngx-toastr';
import { DateFormatPipe } from '../dateFormat/date-format-pipe.pipe';
import { ItemService } from '../services/item.service';
import { PurchaseOrderService } from '../services/purchase-order.service'
import { ItemDetailComponent } from '../item-detail/item-detail.component';
import { EventEmitterService } from '../services/event-emitter-service'; 


@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit, AfterViewInit {

  itemListDS = new MatTableDataSource();
  itemColumns = ['itemNumber', 'itemType', 'itemMake', 'itemDescription', 'itemModel', 'qty', 'itemAmount', 'adminFeeDue', 'balance',
    'edit', 'delete'];
  @ViewChild(ItemDetailComponent, {static: true}) itemDetail: ItemDetailComponent;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  @Input() poId: number;
  @Input() fsaId: number;

  @Input() bidType: string;
  @Input() currentBid: BidNumber;
  @Input() payCd: string;
  @Input() enableItemDetail: boolean;
  @Output() refreshPoDetail: EventEmitter<number> = new EventEmitter();

  enableList: boolean;
  selectedItem: Item;
  rowSelected: boolean;
  readOnly: boolean;

  constructor(private eventEmitterService: EventEmitterService, private purchaseOrderService: PurchaseOrderService, private itemService: ItemService, private toastr: ToastrService) { }

  async refreshItemListHandler(poId: number) {
    await this.refreshPoList(poId);
  }

  async refreshPoDetailHandler(poId: number) {
    console.log('Fired.  How to fire PO Details ?' + poId)
    this.eventEmitterService.onRefreshPoDetail(poId);
    
  }

  private getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  deleteItem(row) {

    const promise = this.itemService.getItemHasPayment(row.id).toPromise();
    promise.then((data) => {
      if (data.length > 0) {
        alert('Unable to delete Purchase Order Item '  + row.itemNumber   + '.  Purchase Order Item has an applied payment. ' +
        ' To delete a Purchase Order Item you must remove the applied payment.');
        return
      } else {

        if (confirm('Are you sure you want to delete Item ? ' + row.id + '  ' + row.itemDescription)) {

          this.itemService.deleteItem(row.id, this.getCurrentUserName()).subscribe(po => {
          });

          this.enableItemDetail = false;

          this.refreshPoList(row.fsaCppPurchaseOrderId);

          this.toastr.success('Item delete Successful', 'Item Delete', {
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

  async refreshPoList(poId: number) {

  //  this.delay(1000).then(any => {
      await this.getItems(poId);
 //   });

  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log('fired'));
  }

  blah() {
    this.enableList = true;
  }

  chain() {

    if (this.purchaseOrderService.enableItemSection === false) {
      return;
    }

    this.enableItemDetail = true;
    this.itemDetail.createItem();
    this.itemDetail.focusItem();

  }

  ngOnInit() {

    
    this.enableList = false;

    this.getItems(this.poId);

   

  }

  firstFunction() {    
    alert( 'Hello ' + '\nWelcome to C# Corner \nFunction in First Component');    
  }  

  ngAfterViewInit() {

    this.itemListDS.sort = this.sort;
    this.itemListDS.paginator = this.paginator;

    this.readOnly =  this.purchaseOrderService.isReadOnly();

  }

  setItemListRowSelected(val: boolean) {
    this.rowSelected = val;
  }

  getItems(poId: number) {

    this.enableItemDetail = false;

    this.itemService.getItemByPo(poId)
      .subscribe(items => {
        this.itemListDS.data = items;
        //     this.enableItemDetail = (items.length > 0 ? true : false);
        this.enableList = (items.length > 0 ? true : false);
      });

  }

  onSelect(item: Item): void {

    if (this.purchaseOrderService.enableItemSection === false) {
      return;
    } else {
      this.selectedItem = item;

      this.enableItemDetail = true;

      this.setItemListRowSelected(true);
      this.itemDetail.getItem(item.id);
      console.log();

      this.itemDetail.focusItem();
    }

  }

  onSelectPayment(item: Item) {

  }

}
