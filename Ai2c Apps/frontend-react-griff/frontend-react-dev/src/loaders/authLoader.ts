import { redirect } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { cancellationMiddleware } from '@store/cancellationMiddleware';
import { IAppUser, IAppUserDto, mapToIAppUser } from '@store/griffin_api/users/models/IAppUser';
import { setAppUser } from '@store/slices';
import { store } from '@store/store';

const { VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM, VITE_KEYCLOAK_CLIENT } = import.meta.env;

export const loginUrl: string = import.meta.env.VITE_GRIFFIN_API_URL + '/who-am-i';

export const authLoader = async () => {
  // Await Fetch User
  const user: IAppUser = await fetch(loginUrl, { credentials: 'include', redirect: 'manual' as RequestRedirect })
    .then(async (data) => {
      const apiRequestId = uuidv4();
      store.dispatch(cancellationMiddleware({ type: 'API_REQUEST_START', meta: { apiRequestId } }));
      if (data.status === 0 && data.type === 'opaqueredirect') {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => {
              registration.unregister();
            });
          });
        }
        if ('caches' in window) {
          const keyList = await caches.keys();
          await Promise.all(keyList.map((key) => caches.delete(key)));
        }
        // Reload the window, forcing a fresh fetch from the server
        setTimeout(() => {
          const currentLoc = window.location.origin;
          store.dispatch(cancellationMiddleware({ type: 'LOCATION_CHANGE', meta: { apiRequestId } }));
          window.location.replace(
            VITE_KEYCLOAK_URL +
            '/realms/' +
            VITE_KEYCLOAK_REALM +
            '/protocol/openid-connect/auth?client_id=' +
            VITE_KEYCLOAK_CLIENT +
            '&redirect_uri=' +
            currentLoc +
            '&response_type=code');
        }, 1000);
      } else {
        store.dispatch(cancellationMiddleware({ type: 'API_REQUEST_SUCCESS', meta: { apiRequestId } }));
        return data.json();
      }
    })
    .then((appUserDto: IAppUserDto) => mapToIAppUser(appUserDto));

  if (user) {
    if (user.newUser) {
      return redirect('create-account');
    }
    store.dispatch(setAppUser(user));
    return user;
  }

  throw new Error('Login failed');
};
