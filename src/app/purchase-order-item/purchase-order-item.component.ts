import { Component, Input, ViewChild, OnInit, AfterViewInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {MatPaginator, MatTableDataSource , MatSort} from '@angular/material';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { ItemService } from '../services/item.service';
import { Item } from '../model/index';

@Component({
  selector: 'app-purchase-order-item',
  templateUrl: './purchase-order-item.component.html',
  styleUrls: ['./purchase-order-item.component.scss']
})
export class PurchaseOrderItemComponent implements OnInit, AfterViewInit {

  displayedColumns = ['itemNumber', 'itemType',  'itemDescription', 'itemAmount', 'qty', 'edit', 'addPayment'];

  itemDataSource = new MatTableDataSource();
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  items: Item[] = [];
  selecteditem: Item;
  @Output() refreshItemList: EventEmitter<string> =   new EventEmitter();

  constructor(private itemService: ItemService) { }

  ngOnInit() {
    this.getItemList(592);
  }

  ngAfterViewInit() {
    this.itemDataSource.sort = this.sort;
    this.itemDataSource.paginator = this.paginator;
  }

  getItemList(purchaseOrderId: number) {

    this.itemService.getItemByPo(purchaseOrderId)
    .subscribe(_items => {
        this.items = _items;
        this.itemDataSource.data = _items;

    });
  }

  getItemDetail(itemId: number) {

    this.itemService.getItemById(itemId)
    .subscribe(_item => {
        this.selecteditem = _item;

    });

  }

  onSelect(item: Item): void {
  }

  newPayment(item: Item): void {
  }


}
