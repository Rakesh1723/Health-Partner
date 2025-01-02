import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = sessionStorage.getItem('hp-token');

  if (jwt) {
    req = req.clone({
      setHeaders: { Authorization: 'Bearer ' + jwt },
    });
  }
  return next(req);
};
