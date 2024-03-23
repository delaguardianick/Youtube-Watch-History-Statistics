import { Component } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

// components
import { AppTopCardsComponent } from '../../components/dashboard1/top-cards/top-cards.component';
import { AppRevenueUpdatesComponent } from '../../components/dashboard1/revenue-updates/revenue-updates.component';
import { AppYearlyBreakupComponent } from '../../components/dashboard1/yearly-breakup/yearly-breakup.component';
import { AppMonthlyEarningsComponent } from '../../components/dashboard1/monthly-earnings/monthly-earnings.component';
import { AppEmployeeSalaryComponent } from '../../components/dashboard1/employee-salary/employee-salary.component';
import { AppCustomersComponent } from '../../components/dashboard1/customers/customers.component';
import { AppProductsComponent } from '../../components/dashboard2/products/products.component';
import { AppSocialCardComponent } from '../../components/dashboard1/social-card/social-card.component';
import { AppSellingProductComponent } from '../../components/dashboard1/selling-product/selling-product.component';
import { AppWeeklyStatsComponent } from '../../components/dashboard1/weekly-stats/weekly-stats.component';
import { AppTopProjectsComponent } from '../../components/dashboard1/top-projects/top-projects.component';
import { AppProjectsComponent } from '../../components/dashboard1/projects/projects.component';

@Component({
  selector: 'main-dashboard',
  standalone: true,
  imports: [
    TabAppTopCardsComponent
  ],
  templateUrl: './main-dashboard.component.html',
})
export class AppDashboard1Component {
  constructor() {}
}
