import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
// import * as fromUserData from '/state/reducers/user-data.reducer';
import { EffectsModule } from '@ngrx/effects';
// import { UserDataEffects } from './effects/user-data.effects';

@NgModule({
    declarations: [
        AppComponent
        // AppComponent is removed from declarations array
    ],
    imports: [
        BrowserModule,
      MaterialModule,

        // StoreModule.forFeature(fromUserData.userDatasFeatureKey, fromUserData.reducer),
        // EffectsModule.forFeature([UserDataEffects])
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }


// @NgModule({
//     declarations: [AppComponent, BlankComponent, FilterPipe],
//     imports: [
//       BrowserModule,
//       AppRoutingModule,
//       HttpClientModule,
//       BrowserAnimationsModule,
//       FormsModule,
//       ReactiveFormsModule,
//       MaterialModule,
//       TablerIconsModule.pick(TablerIcons),
//       TranslateModule.forRoot({
//         loader: {
//           provide: TranslateLoader,
//           useFactory: HttpLoaderFactory,
//           deps: [HttpClient],
//         },
//       }),
//       NgScrollbarModule,
//       FullComponent,
//     ],
//     exports: [TablerIconsModule],
//     bootstrap: [AppComponent],
//   })
//   export class AppModule {}
  