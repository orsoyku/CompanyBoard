import { Route } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

export default [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component').then((c) => c.HomePageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'employee',
    loadComponent: () => import('./pages/employee/employee.component').then((c) => c.EmployeeComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'company',
    loadComponent: () => import('./pages/company/company.component').then((c) => c.CompanyComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    component: PageNotFoundComponent
  },
] satisfies Route[];
