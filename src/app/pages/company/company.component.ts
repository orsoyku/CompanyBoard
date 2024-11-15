import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { IndexedDbService } from '../../services/indexed-db.service';
import { ICompany } from '../../models';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgForOf, NgxSpinnerModule],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyComponent implements OnInit, OnDestroy {
  companies: ICompany[] = [];
  selectedCompany: ICompany | null = null;
  companyForm: FormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private dbService: IndexedDbService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    protected cd: ChangeDetectorRef,
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  private buildForm() {
    this.companyForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  loadCompanies(): void {
    this.spinner.show();
    const loadSubscription = this.dbService.getCompanies().subscribe({
      next: (data: ICompany[]) => {
        this.companies = [...data];
        this.cd.detectChanges();
        this.spinner.hide();
      },
      error: (err: Error) => {
        console.error('Error fetching companies', err);
        this.spinner.hide();
      },
    });
    this.subscriptions.add(loadSubscription);
  }

  addCompany(): void {
    if (this.companyForm.valid) {
      const newCompany: ICompany = {
        id: Date.now(),
        name: this.companyForm.value.name
      };
      this.spinner.show();
      const addSubscription = this.dbService.addCompany(newCompany).subscribe({
        next: () => {
          this.companies = [...this.companies, newCompany];
          this.companyForm.reset();
          this.spinner.hide();
        },
        error: (err: Error) => {
          console.error('Error adding company', err);
          this.spinner.hide();
        },
      });
      this.subscriptions.add(addSubscription);
    }
  }

  editCompany(company: ICompany): void {
    this.selectedCompany = company;
    this.companyForm.patchValue({
      id: company.id,
      name: company.name,
    });
  }

  updateCompany(): void {
    if (this.companyForm.valid && this.selectedCompany) {
      const updatedCompany: ICompany = {
        id: this.companyForm.value.id,
        name: this.companyForm.value.name,
      };
      this.spinner.show();
      const updateSubscription = this.dbService.updateCompany(updatedCompany).subscribe({
        next: () => {
          this.loadCompanies();
          this.selectedCompany = null;
          this.companyForm.reset();
          this.spinner.hide();
        },
        error: (err: Error) => {
          console.error('Error updating company', err);
          this.spinner.hide();
        },
      });
      this.subscriptions.add(updateSubscription);
    }
  }

  deleteCompany(id: number): void {
    this.spinner.show();
    const deleteSubscription = this.dbService.deleteCompany(id).subscribe({
      next: () => {
        this.companies = this.companies.filter(company => company.id !== id);
        this.cd.detectChanges();
        this.spinner.hide();
      },
      error: (err: Error) => {
        console.error('Error deleting company', err);
        this.spinner.hide();
      },
    });
    this.subscriptions.add(deleteSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
