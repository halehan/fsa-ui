import { Component, AfterViewInit } from '@angular/core';
import { User } from '../model/index';
import { Message } from '../model/index';
import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';
import { ContentService } from '../services/content.service';
import { MessageListComponent } from '../message-list/message-list.component';
import { NavbarService } from '../navbar/navbar.service';
// import fontawesome from '@fortawesome/fontawesome';
import { faAddressBook, faCoins, faChartPie, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {

  faAddressBook = faAddressBook;
  faCoins = faCoins;
  faChartPie = faChartPie;
  faSignOutAlt = faSignOutAlt;
  vendors: String[] = [];
  poPayBal: String[] = [];
  topVendor = [];
  data = [];
 // test: Array<any> = [];
  test = [];
  poBal: Array<any> = [];
  columnNamesx =  ['Bid Nnumber', 'poNumber', 'adminFeeDue', 'SumofPayments', 'balance' ]
  type: String = 'Table';
  datax = [];

  title_ = 'Fees Per Year and Partner';
  type_ = 'BarChart';
 columnNames = ['Year', 'FSA-Fee', 'FAC-Fee', 'FFCA-Fee'];
  options = {   
    vAxis: {title: 'Year-Partner'},
    hAxis: {title: 'Partner Fees'},
     isStacked:true	  
  };
  width = 550;
  height = 400;


  chart = {
    title: 'Top 15 Vendors Per Year',
    type: 'BarChart',
    is3D: true,
    columnNames: ['dealerName', 'POAdminFee'],
    options: {
      hAxis: {title: 'Total Purchase Order Amounts'},
     vAxis: {title: 'Vendors'}
    }
  };

  chart_stacked = {
    title: 'Top ',
    type: 'BarChart',
    data: [
      ['2017', 'Fire-Rescue', 561691.79, 45860.20, 131178.36, 158 ],
      ['2017', 'Heavy', 1560144.54, 217608.65,  , 0, 1616 ],
      ['2017', 'Light', 925885.37, 69346.55, 0, 1791 ],
      ['2017', 'Tires', 112545.14, 0, 0,  11 ],
      ['2018', 'Fire-Rescue', 561691.79, 45860.20, 131178.36, 158 ],
    ],
    columnNames: ['Year', 'Bidtype', 'Fsa', 'Fac', 'Ffca','items'],
    options:  {
      hAxis: {
         title: 'Year'
      },
      vAxis:{
         minValue: 0
      },
      isStacked: true
   },
   width: 550,
   height: 400
  };

  titlex = 'Company Hiring Report';  
  typex = 'ComboChart';  
 
  columnNamesxx = ['Loaction','India','US','Average'];  
  optionsx = {     
     hAxis: {  
        title: 'Department'  
     },  
     vAxis:{  
        title: 'Employee hired'  
     },  
     seriesType: 'bars',  
     series: {2: {type: 'line'}}  
  };  
  widthx = 600;  
  heightx = 400;  


  users: User[] = [];
  messages: Message[] = [];
  count = 0;
 // title = '';

  constructor(public nav: NavbarService,
    private userService: UserService,
    private messageService: MessageService,
    private contentService: ContentService ) { }

    ngAfterViewInit() {

    this.contentService.getPoPaymentUnbalanced('1')
    .subscribe(_data => {
     this.poPayBal = _data;

     _data.forEach(row => {

      const temp_row = [
        row.bidNumber,
        row.poNumber,
        row.POAdminFeeDue,
        row.SumofPayments,
        row.Balance
      ]
      this.poBal.push(temp_row);
    });

    });


    this.contentService.getTopVendorReport('2019')
    .subscribe(_vendors => {
     this.vendors = _vendors;

     _vendors.forEach(row => {

       const temp_row = [
         row.dealerName,
         row.POAdminFee
       ]
       this.test.push(temp_row);
     });

     this.data = [
      ['2016 Fire-Rescue', 494721.98, 29154.86, 118489.51],
      ['2016 Heavy', 1593531.67, 200714.91, 0.00],
      ['2016 Light', 962334.19, 77599.58, 0.00],
      ['2016 Tires', 151145.12, 0, 0],
      ['2017 Fire-Rescue', 561691.79, 45860.20, 131178.36],
      ['2017 Heavy', 1560144.54, 217608.65, 0.00],
      ['2017 Light', 925885.37, 69346.55, 0.00],
      ['2017 Tires', 112545.14, 0, 0],
      ['2018 Fire-Rescue', 528850.21, 43126.36, 121034.26],
      ['2018 Heavy', 1462739.03, 227134.39, 0.00],
      ['2018 Light', 1185555.94, 99291.12, 0.00],
      ['2018 Tires', 119815.66, 0, 0]
   ];
   console.log('=========== data ===========');
   console.log(this.data);
   console.log('=========== data ===========');

   console.log('=========== test ===========');
   console.log(this.test);
   console.log('=========== test ===========');
 });


     // get messages from secure api end point
     this.nav.show();
     this.nav.dashActive = 'active';
     this.nav.homeActive = '';
     this.nav.profileActive = '';
     this.nav.listActive = '';
     this.nav.bidActive = '';
     this.nav.userActive = '';
     this.nav.reportActive = '';

     this.userService.getAll()
     .subscribe(users => {
         this.users = users;

     });

  }

}
