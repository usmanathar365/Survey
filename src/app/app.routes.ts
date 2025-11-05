import { Routes } from '@angular/router';
import { CheckerComponentComponent } from './checker-component/checker-component.component';
import { SuccessConfirmationComponent } from './success-confirmation/success-confirmation.component';

export const routes: Routes = [
  {
    path: '',
    component: CheckerComponentComponent,
  },
  {
    path: 'success',
    component: SuccessConfirmationComponent,
  },
];
