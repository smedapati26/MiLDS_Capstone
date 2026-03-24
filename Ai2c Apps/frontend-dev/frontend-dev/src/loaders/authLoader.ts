import { redirect } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { IAppUser, IAppUserDto, mapToIAppUser } from '@store/amap_ai/user/models';
import { cancellationMiddleware } from '@store/cancellationMiddleware';
import { setAppUser } from '@store/slices';
import { store } from '@store/store';

const { VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM, VITE_KEYCLOAK_CLIENT } = import.meta.env;

export const loginUrl: string = import.meta.env.VITE_AMAP_API_URL + '/v1/who-am-i';

export const authLoader = async () => {
  // Await Fetch User
  const user: IAppUser = await fetch(loginUrl, { credentials: 'include', redirect: 'manual' as RequestRedirect })
    .then((data) => {
      const apiRequestId = uuidv4();
      store.dispatch(cancellationMiddleware({ type: 'API_REQUEST_START', meta: { apiRequestId } }));
      if (data.status === 0 && data.type === 'opaqueredirect') {
        const currentLoc = encodeURIComponent(window.location.href);
        store.dispatch(cancellationMiddleware({ type: 'LOCATION_CHANGE', meta: { apiRequestId } }));
        window.location.href =
          VITE_KEYCLOAK_URL +
          '/realms/' +
          VITE_KEYCLOAK_REALM +
          '/protocol/openid-connect/auth?client_id=' +
          VITE_KEYCLOAK_CLIENT +
          '&redirect_uri=' +
          currentLoc +
          '&response_type=code';
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
