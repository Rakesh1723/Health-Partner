import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return sessionStorage.getItem('hp-auth') !== null;
  state.url = '';
};
