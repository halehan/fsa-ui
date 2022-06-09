import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImportServiceService {


  constructor(private http: Http) {}

  server: string = environment.nodeServer;
  springBoot = 'http://localhost:8080' 
  nodeUrl  = `${this.server}/api/import/list/`;
  springBootUrl  = `${this.springBoot}/api/import/`;


  async postFile(data: FormData) {
     return this.http.post(this.springBootUrl + 'uploadBidItems', data).map(data => console.log('returned = ' + data)).toPromise();
   }

  async deleteBatchImport(importHash: String) {
    return this.http.get(`${this.server}/api/import/delete/${importHash}`, this.jwt()).map((response: Response) => response.json()).toPromise();
  }

  getImportRowsbyTableName(tableName: string)  {
    return this.http.get(this.nodeUrl + tableName, this.jwt()).map((response: Response) => response.json());
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
