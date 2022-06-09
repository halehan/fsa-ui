import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/index';
import { HomeComponent } from './home/index';
import { AuthGuard } from './guards/index';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { MessageComponent } from './message/message.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { UserComponent } from './user/user.component';
import { AtableListComponent } from './atable-list/atable-list.component';
import { ReportsComponent } from './reports/reports.component';
import { PaymentComponent } from './payment/payment.component';
import { SearchByCheckComponent } from './search-by-check/search-by-check.component';
import { TestingComponent } from './testing/testing.component';
import { AdminFeeDistComponent } from './maint/admin-fee-dist/admin-fee-dist.component';
import { CityAgencyComponent } from './maint/city-agency/city-agency.component';
import { VendorComponent } from './maint/vendor/vendor.component';
import { BidNumberComponent } from './maint/bid-number/bid-number.component';
import { BidItemCodesComponent } from './maint/bid-item-codes/bid-item-codes.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { VendorFineComponent } from './vendor-fine/vendor-fine.component';
import { ChartsComponent } from './charts/charts.component';
import { ImportProcessComponent } from './import-process/import-process.component';


const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'message', component: MessageComponent, canActivate: [AuthGuard] },
    { path: 'user', component: UserComponent, canActivate: [AuthGuard] },
    { path: 'transaction', component: PurchaseOrderComponent, canActivate: [AuthGuard] },
    { path: 'bids', component: PurchaseOrderComponent, canActivate: [AuthGuard] },
    { path: 'list', component: AtableListComponent, canActivate: [AuthGuard] },
    { path: 'search', component: SearchByCheckComponent, canActivate: [AuthGuard] },
    { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
    { path: 'payments', component: PaymentComponent, canActivate: [AuthGuard] },
    { path: 'transactions/:bidId', component: PurchaseOrderComponent, canActivate: [AuthGuard] },
    { path: 'testing', component: TestingComponent },
    { path: 'fee', component: AdminFeeDistComponent, canActivate: [AuthGuard] },
    { path: 'agency', component: CityAgencyComponent, canActivate: [AuthGuard] },
    { path: 'vendor', component: VendorComponent, canActivate: [AuthGuard] },
    { path: 'bidType', component: BidNumberComponent, canActivate: [AuthGuard] },
    { path: 'bidItemCodes', component: BidItemCodesComponent, canActivate: [AuthGuard] },
    { path: 'sideBar', component: SidebarComponent, canActivate: [AuthGuard] },
    { path: 'vendorFine', component: VendorFineComponent, canActivate: [AuthGuard] },
    { path: 'importPage', component: ImportProcessComponent, canActivate: [AuthGuard] },
    { path: 'charts', component: ChartsComponent } ,

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
