import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, AfterViewChecked } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ContentService } from '../services/content.service';
import { CityAgency } from '../model/cityAgency';
import { timingSafeEqual } from 'crypto';


@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit, AfterViewInit {

  @ViewChild('pieChart', {static: true}) pieChart: ElementRef;
  @ViewChild('barChart', {static: true}) barChart: ElementRef;
  @ViewChild('payeeChart', {static: true}) payeeChart: ElementRef;
  @ViewChild('topAgencyChart', {static: true}) topAgencyChart: ElementRef;
  @ViewChild('topVendorChart', {static: true}) topVendorChart: ElementRef;
  @ViewChild('activeBidChart', {static: true}) activeBidChart: ElementRef;
  @ViewChild('inactiveBidChart', {static: true}) inactiveBidChart: ElementRef;

  @ViewChild('poItemActivityChart', {static: true}) poItemActivityChart: ElementRef;
  @ViewChild('paymentActivityChart', {static: true}) paymentActivityChart: ElementRef;

  @ViewChild('finalPaginator',  {static: true,  read: MatPaginator }) finalPaginator: MatPaginator;
  @ViewChild('notFinalPaginator', {static: true,  read: MatPaginator }) notFinalPaginator: MatPaginator;
  @ViewChild('reportAgencyYearPaginator', { static: true, read: MatPaginator }) reportAgencyYearPaginator: MatPaginator;
  @ViewChild('reportAgencyYearPaginator2', {static: true,  read: MatPaginator }) reportAgencyYearPaginator2: MatPaginator;
  @ViewChild('reportAgencyYearPaginator3', { static: true, read: MatPaginator }) reportAgencyYearPaginator3: MatPaginator;

  @ViewChild('unBalancedFinalSort', {static: true})  unBalancedFinalSort:  MatSort;
  @ViewChild('unBalancedNotFinalSort', {static: true})  unBalancedNotFinalSort:  MatSort;

  @ViewChild('reportAgencyYearSort', {static: true})  reportAgencyYearSort:  MatSort;
  @ViewChild('reportAgencyYearSort2', {static: true}) reportAgencyYearSort2: MatSort;
  @ViewChild('reportAgencyYearSort3', {static: true}) reportAgencyYearSort3: MatSort;

  google: any;
  poBal: Array<any> = [];
  poPayBal: String[] = [];
  partnerFee: Array<any> = [];
  partnerAllocations: Array<any> = [];
  topVendor: Array<any> = [];
  topAgency: Array<any> = [];
  activeBid: Array<any> = [];
  inactiveBid: Array<any> = [];
  poItemActivity: Array<any> = [];
  paymentActivity: Array<any> = [];
  enableLevel2: boolean;
  panelOpenState: boolean;

  unBalancedFinal = new MatTableDataSource();
  unBalancedNotFinal = new MatTableDataSource();
  reportCityAgency = new MatTableDataSource();
  reportCityAgency2 = new MatTableDataSource();
  reportCityAgency3 = new MatTableDataSource();

  @ViewChild(MatSort,  {static: true}) reportCityAgencySort: MatSort;

  selectedCityAgency: string;
  selectedYear: string;
  selectedBalance: number;

  unbalancedColumns: String[] = ['bidNumber', 'poNumber', 'balance', 'adminFeeDue', 'payment', 'paymentBalance',
    'acceptablePaymentBalance'];

  reportCityAgencyCols: String[] = ['year', 'cityAgency', 'adminFee', 'payment', 'balance'];

  reportCityAgencyPayments: String[] = ['poNumber', 'dealerName', 'sumFee', 'sumPayment', 'balance'];

  reportCityAgencyNoPayments: String[] = ['poNumber', 'dealerName', 'sumFee', 'sumPayment', 'balance'];

  constructor(private contentService: ContentService) {  }

  getLevel2(row) {

    const cityAgency: string = row.cityAgency;
    const year: string = row.year;

    this.selectedCityAgency = row.cityAgency;
    this.selectedYear = row.year;
    this.selectedBalance = row.balance

    this.contentService.getReportCityAgency2(cityAgency, year)
      .subscribe(_data => {
        this.reportCityAgency2.data = _data;

      });

    this.contentService.getReportCityAgency3(cityAgency, year)
      .subscribe(_data => {
        this.reportCityAgency3.data = _data;

      });

    this.enableLevel2 = true;
  }

  getLevel3(row) {

    const cityAgency: string = row.cityAgency;
    const year: string = row.year;

    this.contentService.getReportCityAgency3(cityAgency, year)
      .subscribe(_data => {
        this.reportCityAgency3.data = _data;

      });

    this.enableLevel2 = true;
  }

  ngOnInit() {
    console.log('ngOnInit');

    google.charts.load('current', { packages: ['corechart', 'bar'] });
    google.charts.setOnLoadCallback(this.drawChart);

    const header_row = [
      'Year',
      'FSA Fees',
      'FAC Fees',
      'FFCA Fees'
    ]

    const payeeAlloc_row = [
      'Partner', 'Fees'
    ]

    const topVendorObservable =  this.contentService.getReportTopVendor()

    topVendorObservable.subscribe((_topVendor: any[]) => {
      this.topVendor = _topVendor;

    google.charts.setOnLoadCallback(this.drawTopVendorChart);

    });

    const topAgencyObservable =  this.contentService.getReportTopAgency()

    topAgencyObservable.subscribe((_topAgency: any[]) => {
      this.topAgency = _topAgency;

    google.charts.setOnLoadCallback(this.drawTopAgencyChart);

    });

    const activeBidObservable =  this.contentService.getReportBids('active');

    activeBidObservable.subscribe((_activeBid: any[]) => {
      this.activeBid = _activeBid;

    google.charts.setOnLoadCallback(this.drawActiveBid);

    });

    const inactiveBidObservable =  this.contentService.getReportBids('inactive');

    inactiveBidObservable.subscribe((_inactiveBid: any[]) => {
      this.inactiveBid = _inactiveBid;

    google.charts.setOnLoadCallback(this.drawInActiveBid);

    });

    const itemActivityObservable =  this.contentService.getReportItemActivity();

    itemActivityObservable.subscribe((_poItemActivity: any[]) => {
      this.poItemActivity = _poItemActivity;

    google.charts.setOnLoadCallback(this.drawItemActivity);

    });

    const paymentActivityObservable =  this.contentService.getReportPaymentActivity();

    paymentActivityObservable.subscribe((_paymentActivity: any[]) => {
      this.paymentActivity = _paymentActivity;

    google.charts.setOnLoadCallback(this.drawPaymentActivity);

    });

    const partnerAllocationsObservable =  this.contentService.getReportPayeeAllocations();

    this.partnerAllocations.push(payeeAlloc_row);
    partnerAllocationsObservable.subscribe((partnerAlloc: any[]) => {

    const userStr = JSON.stringify(partnerAlloc);

    JSON.parse(userStr, (key, value) => {

      if (key === 'fsaAlloc') {
        const obj = ['FSA Alloc', value]
        this.partnerAllocations.push(obj);
      }
      if (key === 'facAlloc') {
        const obj = ['FAC Alloc', value]
        this.partnerAllocations.push(obj);
      }
      if (key === 'ffcaAlloc') {
        const obj = ['FFCA Alloc', value]
        this.partnerAllocations.push(obj);
      }
/*
      if (key === 'fsaAlloc') {
        const obj = [key, value]
        this.partnerAllocations.push(obj);
      }
      if (key === 'facAlloc') {
        const obj = [key, value]
        this.partnerAllocations.push(obj);
      }
      if (key === 'ffcaAlloc') {
        const obj = [key, value]
        this.partnerAllocations.push(obj);
      }
*/

      });

      google.charts.setOnLoadCallback(this.drawChart);

    });

    this.partnerFee.push(header_row);

    const partnerFeeObservable = this.contentService.getPartnerFees();

    partnerFeeObservable.subscribe((partnerFee: any[]) => {

      partnerFee.forEach(row => {

        const temp_row = [
          row.year,
          row.fsaFee,
          row.facFee,
          row.ffcaFee
        ]
        this.partnerFee.push(temp_row);
        google.charts.setOnLoadCallback(this.drawPayeeChart);

      });

    });

    this.contentService.getPoPaymentUnbalanced('1')
      .subscribe(_data => {
        this.unBalancedFinal.data = _data;

      });

    this.contentService.getPoPaymentUnbalanced('0')
      .subscribe(_data => {
        this.unBalancedNotFinal.data = _data;

      });

    this.contentService.getReportCityAgency()
      .subscribe(_data => {
        this.reportCityAgency.data = _data;

      });

  }

  ngAfterViewInit() {
    this.unBalancedFinal.paginator = this.finalPaginator;
    this.unBalancedNotFinal.paginator = this.notFinalPaginator;

    this.unBalancedFinal.sort = this.unBalancedFinalSort;
    this.unBalancedNotFinal.sort = this.unBalancedNotFinalSort;

    this.reportCityAgency.paginator = this.reportAgencyYearPaginator
    this.reportCityAgency2.paginator = this.reportAgencyYearPaginator2;
    this.reportCityAgency3.paginator = this.reportAgencyYearPaginator3;

    this.reportCityAgency.sort =  this.reportAgencyYearSort;
    this.reportCityAgency2.sort = this.reportAgencyYearSort2;
    this.reportCityAgency3.sort = this.reportAgencyYearSort3;


    console.log('ngAfterViewInit');

  };

  drawPayeeChart = () => {

    const payeeFee = google.visualization.arrayToDataTable(
      this.partnerFee
    );

    const partnerFeeOptions = {
      width: 650,
      height: 400,
      isStacked: true,
      colors: ['#27880d', 'blue', 'red'],
      chart: {
        title: 'Partner Fee Distributions'
      },
      hAxis: {
        title: 'Total Fees',
        minValue: 0,
      },
      vAxis: {
        title: 'Payee Partners'
      },
      bars: 'horizontal'
    };

    const payeeChart = new google.visualization.BarChart(this.payeeChart.nativeElement);
    payeeChart.draw(payeeFee, partnerFeeOptions);

  }

  drawChart = () => {
    console.log('drawChart');

    const data = google.visualization.arrayToDataTable(
      this.partnerAllocations
    );

    console.log(data);

    const options = {
      title: 'Distribution for Partner Payees for 2017-2019',
      width: 600,
      height: 400,
      is3D: true,
      bar: { groupWidth: '95%' },
      slices: {0: {color: '#27880d'}, 1: {color: 'blue'}, 2: {color: 'red'}}
    };

    const chart = new google.visualization.PieChart(this.pieChart.nativeElement);
    chart.draw(data, options);

  };

  drawTopAgencyChart = () => {

    const  data = new google.visualization.DataTable();

    data.addColumn('string', 'cityAgency');
    data.addColumn('number', 'adminFeeDue');

    this.topAgency.forEach(function(item){
      console.log( parseFloat(item.adminFeeDue));
      console.log(item.cityAgency);

      data.addRow([
        (item.cityAgency),
        parseFloat(item.adminFeeDue),
      ]);
    });

    const options = {
      title: 'Top 10 Agency Purchase Order Volume for 2017-2019',
      height: 425,
      width: 600,
      is3D: true,
      bar: { groupWidth: '95%' }
    };

    const chart = new google.visualization.PieChart(this.topAgencyChart.nativeElement);
    chart.draw(data, options);

  };

  drawTopVendorChart = () => {

    const  data = new google.visualization.DataTable();

    data.addColumn('string', 'dealerName');
    data.addColumn('number', 'poAmount');

    this.topVendor.forEach(function(item){
      console.log( parseFloat(item.poAmount));
      console.log(item.dealerName);

      data.addRow([
        (item.dealerName),
        parseFloat(item.poAmount),
      ]);
    });

    const options = {
      title: 'Top 10 Vendor Purchase Order Volume for 2017-2019',
      height: 425,
      width: 600,
      is3D: true,
      bar: { groupWidth: '95%' }
    };

    const chart = new google.visualization.PieChart(this.topVendorChart.nativeElement);
    chart.draw(data, options);

  };

  drawActiveBid = () => {

    const  data = new google.visualization.DataTable();

    data.addColumn('string', 'BidNumber');
    data.addColumn('number', 'adminFee');

    this.activeBid.forEach(function(item) {
      console.log(item.BidNumber);
      console.log( parseFloat(item.adminFee));

      data.addRow([
        (item.BidNumber),
        parseFloat(item.adminFee),
      ]);
    });

    const options = {
      title: 'Purchase Order Amounts Active Bids',
      height: 400,
      width: 600,
      is3D: true,
      bar: { groupWidth: '95%' }
    };

    const chart = new google.visualization.PieChart(this.activeBidChart.nativeElement);
    chart.draw(data, options);

  };

  drawInActiveBid = () => {

    const  data = new google.visualization.DataTable();

    data.addColumn('string', 'BidNumber');
    data.addColumn('number', 'adminFee');

    this.inactiveBid.forEach(function(item) {
      console.log(item.BidNumber);
      console.log( parseFloat(item.adminFee));

      data.addRow([
        (item.BidNumber),
        parseFloat(item.adminFee),
      ]);
    });

    const options = {
      title: 'Purchase Order Amounts InActive Bids',
      height: 400,
      width: 600,
      is3D: true,
      bar: { groupWidth: '95%' }
    };

    const chart = new google.visualization.PieChart(this.inactiveBidChart.nativeElement);
    chart.draw(data, options);

  };

  drawItemActivity = () => {

    const  data = new google.visualization.DataTable();

    data.addColumn('string', 'createdBy');
    data.addColumn('number', 'count');

    this.poItemActivity.forEach(function(item) {
      data.addRow([
        (item.createdBy),
        (item.count),
      ]);
    });

    const options = {
      title: 'Purchase Order Item Activity',
      height: 400,
      width: 600,
      is3D: true,
      bar: { groupWidth: '95%' }
    };

    const chart = new google.visualization.PieChart(this.poItemActivityChart.nativeElement);
    chart.draw(data, options);

  };

  drawPaymentActivity = () => {

    const  data = new google.visualization.DataTable();

    data.addColumn('string', 'createdBy');
    data.addColumn('number', 'count');

    this.paymentActivity.forEach(function(item) {
      console.log(item.count);
      console.log(item.createdBy);

      data.addRow([
        (item.createdBy),
        (item.count),
      ]);
    });

    const options = {
      title: 'Payment Activity',
      height: 400,
      width: 600,
      is3D: true,
      bar: { groupWidth: '95%' }
    };

    const chart = new google.visualization.PieChart(this.paymentActivityChart.nativeElement);
    chart.draw(data, options);

  };


}
