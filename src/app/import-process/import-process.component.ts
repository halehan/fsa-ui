import { Component, Input, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import {MatPaginator, MatTableDataSource , MatSort} from '@angular/material';
import { ImportServiceService } from '../services/import-service.service';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-import-process',
  templateUrl: './import-process.component.html',
  styleUrls: ['./import-process.component.scss']
})
export class ImportProcessComponent implements OnInit, AfterViewInit {


  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  contractItemDS = new MatTableDataSource();
  contractItemColumns = ['importFileName', 'importTable', 'importDescription', 'importByUser', 'importTime', 'delete'];
  fileName = '';
  importing: boolean = false;

  constructor(private importService: ImportServiceService, private http: Http, private toastr: ToastrService) { }

   ngOnInit() {

     
this.refresh();


  }

  async refresh() {

    this.importService.getImportRowsbyTableName('FsaCppBidItemCodes').subscribe(_val => {
      this.contractItemDS.data = _val;
      console.log(` _val = ${_val}`)
    });


  }

  ngAfterViewInit() {
    this.contractItemDS.sort = this.sort;
    this.contractItemDS.paginator = this.paginator;
  }

  openFile() {
    console.log("hell");
    document.querySelector("input").click();
  }
  handle(e) {
    console.log("Change input file");
    var tempFile;
    tempFile = document.getElementById("inputValue");
    tempFile.value = "";
  }

  private getCurrentUserName() {
    return JSON.parse(localStorage.getItem('currentUser')).username;
  }

  new(row) {
    console.log("new");
  }

  async onFileSelected(event) {

    const file:File = event.target.files[0];
    this.fileName = file.name;

    if (file) {

        const formData = new FormData();

        console.log(` file ${JSON.stringify(file)} `)
        console.log(` fileName ${this.fileName} `)

        formData.append("file", file);
        formData.append("description", 'File for Upload');
        formData.append("email", this.getCurrentUserName());

        try {

       this.importing = true
       let rtnVal = await this.importService.postFile(formData);
       console.log(` rtnVal = ${rtnVal}`)

       await this.refresh()
       this.importing = false;
          

    
        } catch(error) {  
          this.importing = false; 
          console.log(error);
          console.log(error._body);


        }
    }
}

 async deleteImport(row) {

      if (confirm(`Are you sure you want to delete batch Import ?  Name: ${row.importFileName} Imported By: ${row.importByUser} File Size: ${row.importFileSize} `)) {

      const suck =   await this.importService.deleteBatchImport(row.importHash);

      await suck;
        this.toastr.success('Batch Import delete Successful.  All rows related to import have been removed from database', 'Batch Import Delete', {
          timeOut: 3500,
       });

    
        this.refresh()

      }
    


}

 

}
