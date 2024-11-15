import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ICompany, IEmployee } from '../../models';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IndexedDbService } from '../../services/indexed-db.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgForOf, NgxSpinnerModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeComponent implements OnInit, OnDestroy {
  employeeForm: FormGroup;
  companies: ICompany[] = [];
  employees: IEmployee[] = [];
  selectedEmployee: IEmployee | null = null;
  selectedCompany: number | null = null;
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private dbService: IndexedDbService,
    protected cd: ChangeDetectorRef
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required]],
      position: ['', [Validators.required]],
      companyId: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies() {
    const companiesSub = this.dbService.getCompanies().subscribe({
      next: (data: ICompany[]) => {
        this.companies = [...data];
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading companies', err),
    });
    this.subscriptions.add(companiesSub);
  }

  loadEmployees() {
    if (this.selectedCompany === null) return;

    const employeesSub = this.dbService.getEmployees(this.selectedCompany).subscribe({
      next: (employees: IEmployee[]) => {
        this.employees = [...employees];
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading employees', err),
    });
    this.subscriptions.add(employeesSub);
  }

  onCompanyChange(event: any) {
    this.selectedCompany = event.target.value;
    this.loadEmployees();
  }

  addEmployee() {
    if (this.employeeForm.valid && this.selectedCompany !== null) {
      const newEmployee: IEmployee = { ...this.employeeForm.value, id: Date.now() };

      const addEmployeeSub = this.dbService.addEmployee(newEmployee).subscribe({
        next: (employee) => {
          if (employee) {
            this.employees.push(newEmployee);
            this.cd.detectChanges();
            this.employeeForm.reset();
            this.selectedCompany = null;
          }
        },
        error: (err) => console.error('Error adding employee', err),
      });
      this.subscriptions.add(addEmployeeSub);
    }
  }

  editEmployee(employee: IEmployee) {
    this.selectedEmployee = employee;
    const selectedCompany = this.companies.find(company => company.id === employee.companyId);
    if (selectedCompany) {
      this.selectedCompany = selectedCompany.id;
    }
    this.employeeForm.setValue({
      name: employee.name,
      position: employee.position,
      companyId: employee.companyId,
    });
  }

  updateEmployee() {
    if (this.selectedEmployee && this.employeeForm.valid) {
      const updatedEmployee = { ...this.selectedEmployee, ...this.employeeForm.value };

      const updateEmployeeSub = this.dbService.updateEmployee(updatedEmployee).subscribe({
        next: () => {
          const index = this.employees.findIndex(emp => emp.id === updatedEmployee.id);
          if (index !== -1) {
            this.employees[index] = updatedEmployee;
          }
          this.employeeForm.reset();
          this.selectedEmployee = null;
          this.selectedCompany = null;
        },
        error: (err) => console.error('Error updating employee', err),
      });
      this.subscriptions.add(updateEmployeeSub);
    }
  }

  deleteEmployee(id: number | undefined): void {
    if (typeof id !== 'number' || isNaN(id)) {
      console.error('Invalid employee ID:', id);
      return;
    }

    const deleteEmployeeSub = this.dbService.deleteEmployee(id).subscribe({
      next: () => {
        this.employees = this.employees.filter(employee => employee.id !== id);
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error deleting employee', err),
    });
    this.subscriptions.add(deleteEmployeeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
