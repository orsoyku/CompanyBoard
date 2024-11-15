import { switchMap } from "rxjs/operators";
import { ICompany, IEmployee } from "../models";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private db: IDBDatabase | null = null;
  private dbReady = new BehaviorSubject<boolean>(false);

  constructor() {
    // this.initializeDb();
  }

  /**
   * Initializes the IndexedDB database and creates 'companies' and 'employees' tables with default records.
   */
  initializeDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MyDatabase', 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('companies')) {
          const companyStore = db.createObjectStore('companies', { keyPath: 'id' });
          companyStore.transaction.oncomplete = () => {
            const companyTransaction = db.transaction('companies', 'readwrite').objectStore('companies');
            companyTransaction.add({ id: 1, name: 'Company A' });
            companyTransaction.add({ id: 2, name: 'Company B' });
          };
        }

        // if (!db.objectStoreNames.contains('employees')) {
        //   const employeeStore = db.createObjectStore('employees', { keyPath: 'id' });
        //   employeeStore.transaction.oncomplete = () => {
        //     const employeeTransaction = db.transaction('employees', 'readwrite').objectStore('employees');
        //     employeeTransaction.add({ id: 1, name: 'Employee 1', companyId: 1 });
        //     employeeTransaction.add({ id: 2, name: 'Employee 2', companyId: 2 });
        //   };
        // }
        if (!db.objectStoreNames.contains('employees')) {
          const employeeStore = db.createObjectStore('employees', { keyPath: 'id' });
          
          employeeStore.createIndex('companyId', 'companyId');
  
          employeeStore.transaction.oncomplete = () => {
            const employeeTransaction = db.transaction('employees', 'readwrite').objectStore('employees');
            employeeTransaction.add({ id: 1, name: 'Employee 1', companyId: 1 });
            employeeTransaction.add({ id: 2, name: 'Employee 2', companyId: 2 });
          };
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        this.dbReady.next(true);
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error opening IndexedDB', event);
        reject(new Error('Error opening IndexedDB'));
      };
    });
  }

  addCompany(company: ICompany): Observable<any> {
    return this.performTransaction('companies', 'readwrite', (store) => {
      return store.add(company);
    });
  }

  getCompanies(): Observable<ICompany[]> {
    return this.dbReady.pipe(
      switchMap((ready) => {
        if (!ready || !this.db) return of([]);
        return this.performTransaction('companies', 'readonly', (store) => store.getAll());
      })
    );
  }

  updateCompany(company: ICompany): Observable<any> {
    return this.performTransaction('companies', 'readwrite', (store) => {
      return store.put(company);
    });
  }

  deleteCompany(id: number): Observable<void> {
    return this.performTransaction('companies', 'readwrite', (store) => {
      return store.delete(id);
    });
  }

  addEmployee(employee: IEmployee): Observable<any> {
    return this.performTransaction('employees', 'readwrite', (store) => {
      return store.add(employee);
    });
  }

  getEmployees(companyId: number): Observable<IEmployee[]> {
    console.log(companyId)
    return this.dbReady.pipe(
      switchMap((ready) => {
        if (!ready || !this.db) return of([]);
        return this.performTransaction('employees', 'readonly', (store) => {
          const index = store.index('companyId');
          return index.getAll(companyId);
        });
      })
    );
  }

  updateEmployee(employee: IEmployee): Observable<any> {
    return this.dbReady.pipe(
      switchMap((ready) => {
        if (!ready || !this.db) return of([]);
        return this.performTransaction('employees', 'readwrite', (store) => {
          const request = store.getAll();  // Get all employees
  
          return request;  // Returning IDBRequest directly, not Observable
        }).pipe(
          switchMap((employees: IEmployee[]) => {
            const employeeToUpdate = employees.find(
              (e) => e.id === employee.id && e.companyId === employee.companyId
            );
  
            if (employeeToUpdate) {
              // Update employee details if matched
              Object.assign(employeeToUpdate, employee);
  
              return this.performTransaction('employees', 'readwrite', (store) => {
                const updateRequest = store.put(employeeToUpdate); // Update the employee
                return updateRequest;
              });
            } else {
              return of(new Error('Employee not found or does not belong to this company'));  // Error handling
            }
          })
        );
      })
    );
  }
  

  deleteEmployee(id: number): Observable<void> {
    return this.performTransaction('employees', 'readwrite', (store) => {
      return store.delete(id);
    });
  }

  private performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T> | void
  ): Observable<T> {
    return new Observable<T>((observer) => {
      if (!this.db) {
        observer.error(new Error('Database is not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      let request: IDBRequest<T> | void;

      try {
        request = action(store);
      } catch (error) {
        observer.error(error);
        return;
      }

      if (request) {
        request.onsuccess = () => {
          observer.next(request.result);
        };

        request.onerror = (event) => {
          observer.error((event.target as any).error);
        };
      }

      transaction.oncomplete = () => {
        observer.complete();
      };

      transaction.onerror = (event) => {
        observer.error(new Error('Transaction failed'));
      };
    });
  }
}
