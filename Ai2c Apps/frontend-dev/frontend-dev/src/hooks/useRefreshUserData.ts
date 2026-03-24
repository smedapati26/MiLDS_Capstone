import { userApiSlice } from '@store/amap_ai';
import { store } from '@store/store';

const useRefreshUserdata = (id: string) => {
  store.dispatch(userApiSlice.endpoints.getUser.initiate({ userId: id }, { forceRefetch: true }));
};

export default useRefreshUserdata;
