import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { AuthenticationService } from './authentication.service';
import { environment } from '../../environments/environment';
import { AdminFeeDistributionPct } from '../model/adminFeeDistributionPct';
import { CityAgency } from '../model/cityAgency';
import { Dealer } from '../model/dealer';
import { BidNumber } from '../model/bidNumber';
import {ItemBidTypeCode} from '../model/itemBidTypeCode'



@Injectable({
  providedIn: 'root'
})
export class MaintService {

  server: string = environment.nodeServer;
  feeUrl = this.server + '/api/fee/';
  cityAgencyUrl = this.server + '/api/cityAgency/';
  vendorUrl = this.server + '/api/dealer/'
  bidUrl = this.server + '/api/transaction/bids/';
  bidUrlItem = this.server + '/api/transaction/bidItemCode/';
  itemUrl = this.server + '/api/item/';
  stateUrl = this.server + '/api/state/';
  countyUrl = this.server + '/api/county/';
  importUrl =  this.server + '/api/import/';
  agencyTypeUrl = this.server + '/api/agencyType/';
  bidItemCodes = this.server + '/api/biditemcodes/';
  bidByDealer =  this.server + '/api/dealer/assoc/';


  constructor(
    private http: Http,
    private authenticationService: AuthenticationService) {
  }

  insertVendorAssocBid(table: any) {
    const url: string = this.bidByDealer;
    return this.http.post(url, table, this.jwt()).map((response: Response) => response.json());
  }

  deleteVendorAssocBid(id: number) {
    const url: string = this.bidByDealer;
    return this.http.get(url + 'delete/' + id, this.jwt()).map((response: Response) => response.json());
  }


  getImports() {
    const url: string = this.importUrl;
    return this.http.get(url, this.jwt()).map((response: Response) => response.json());
  }

  deleteAgency(id: number) {
    const url: string = this.cityAgencyUrl;
    return this.http.get(url + 'delete/' + id, this.jwt()).map((response: Response) => response.json());
  }

  deleteImport(id: number) {
    const url: string = this.importUrl;
    return this.http.get(url + 'delete/' + id, this.jwt()).map((response: Response) => response.json());
  }

  deleteImportedTableRows(table: string , importHash: string) {
    const url: string = this.importUrl;
    return this.http.get(url + 'deleteTableRows/' + table + '/' + importHash, this.jwt()).map((response: Response) => response.json());
  }

  getBidsByDealer(dealerName: string) {
    const url: string = this.bidByDealer;
    console.log(url + 'dealer/' + dealerName)
    return this.http.get(url + 'dealer/' + dealerName, this.jwt()).map((response: Response) => response.json());
  }

  getAvailableBidsByDealer(dealerName: string) {
    const url: string = this.bidByDealer;
    return this.http.get(url + 'dealer/avail/' + dealerName, this.jwt()).map((response: Response) => response.json());
  }

  getAllBids() {
    const url: string = this.bidUrl;
    return this.http.get(url, this.jwt()).map((response: Response) => response.json());
  }

  getAllItems() {
    const url: string = this.itemUrl;
    return this.http.get(url, this.jwt()).map((response: Response) => response.json());
  }

  updateBid(table: BidNumber) {
    const url: string = this.bidUrl;
    return this.http.put(url, table, this.jwt()).map((response: Response) => response.json());
  }

  updateItemBid(table: ItemBidTypeCode) {
    const url: string = this.bidItemCodes;
    return this.http.put(url, table, this.jwt()).map((response: Response) => response.json());
  }

  insertBid(table: BidNumber) {
    const url: string = this.bidUrl;
    return this.http.post(url, table, this.jwt()).map((response: Response) => response.json());
  }

  insertBidItem(table: ItemBidTypeCode) {
    const url: string = this.bidUrlItem;
    return this.http.post(url, table, this.jwt()).map((response: Response) => response.json());
  }

  getAgencyType() {
    const url: string = this.agencyTypeUrl;
    return this.http.get(url, this.jwt()).map((response: Response) => response.json());

  }
  deleteBid(id: number) {
    const url: string = this.bidUrl;
    return this.http.get(url + 'delete/' + id, this.jwt()).map((response: Response) => response.json());
  }

  deleteBiditem(id: number) {
    const url: string = this.bidUrlItem;
    return this.http.get(url + 'delete/' + id, this.jwt()).map((response: Response) => response.json());
  }

  updateVendor(table: Dealer) {
    const url: string = this.vendorUrl;
    return this.http.put(url, table, this.jwt()).map((response: Response) => response.json());
  }

  insertVendor(table: Dealer) {
    const url: string = this.vendorUrl;
    return this.http.post(url, table, this.jwt()).map((response: Response) => response.json());
  }

  deleteVendor(id: Number) {
    const url: string = this.vendorUrl;
    return this.http.get(url + 'delete/' + id, this.jwt()).map((response: Response) => response.json());
  }

  getAllVendors(sort: String) {
    const url: string = this.vendorUrl;
    return this.http.get(url + sort, this.jwt()).map((response: Response) => response.json());
  }

  getFee() {
    const fee: string = this.feeUrl;
    return this.http.get(fee, this.jwt()).map((response: Response) => response.json());
  }

  getAllCityAgency() {
    const url: string = this.cityAgencyUrl;
    return this.http.get(url, this.jwt()).map((response: Response) => response.json());
  }

  getAllStates() {
    const url: string = this.stateUrl;
    return this.http.get(url, this.jwt()).map((response: Response) => response.json());
  }

  getCounties(state: string) {
    const url: string = this.countyUrl;
    return this.http.get(url + state, this.jwt()).map((response: Response) => response.json());
  }

  updateCityAgency(table: CityAgency) {
    return this.http.put(this.cityAgencyUrl, table, this.jwt()).map((response: Response) => response.json());
  }

  insertCityAgency(table: CityAgency) {
    const url: string = this.cityAgencyUrl;
    return this.http.post(url, table, this.jwt()).map((response: Response) => response.json());
  }

  getFeeById(id: Number) {
    const fee: string = this.feeUrl;
    return this.http.get(fee + id, this.jwt()).map((response: Response) => response.json());
  }

  updateAdminFee(adminFeeDistributionPct: AdminFeeDistributionPct) {
    return this.http.put(this.feeUrl, adminFeeDistributionPct, this.jwt()).map((response: Response) => response.json());
  }

  insertAdminFee(adminFeeDistributionPct: AdminFeeDistributionPct) {
    return this.http.post(this.feeUrl, adminFeeDistributionPct, this.jwt()).map((response: Response) => response.json());
  }

  deleteAdminFee(id: Number) {
    return this.http.get(this.feeUrl + 'delete/' + id, this.jwt()).map((response: Response) => response.json());
  }

  private jwt() {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      //    const headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
      const headers = new Headers({ 'Authorization': currentUser.token });
      return new RequestOptions({ headers: headers });
    }
  }

}
