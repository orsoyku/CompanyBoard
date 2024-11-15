import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { importProvidersFrom, provideExperimentalZonelessChangeDetection } from "@angular/core";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { provideRouter, withRouterConfig } from "@angular/router";
import appRoutes from "./app/app.routes";
import { AuthInterceptor } from "./app/interceptors/auth.interceptor";
import { GoogleLoginProvider, SocialAuthServiceConfig } from "@abacritt/angularx-social-login";
import { IndexedDbService } from './app/services/indexed-db.service';
import { APP_INITIALIZER } from '@angular/core';
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";


export function initializeDb(dbService: IndexedDbService): () => Promise<void> {
  return () => dbService.initializeDb();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideHttpClient(withInterceptors([AuthInterceptor]), withFetch()),
    provideRouter(appRoutes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideAnimationsAsync(),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '502049685485-41kvuo8q83ij7hq8eljfjgo4psd6cg6r.apps.googleusercontent.com'
            )
          },
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    },
    IndexedDbService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeDb,
      deps: [IndexedDbService],
      multi: true
    }
  ],
}).catch((err) => console.error(err));
