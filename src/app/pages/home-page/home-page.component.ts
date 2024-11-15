import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmployeeComponent } from '../employee/employee.component';
import { CompanyComponent } from '../company/company.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [EmployeeComponent, CompanyComponent, NgIf],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  selectedTab: string = 'company';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}
