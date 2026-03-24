import { jwtDecode } from 'jwt-decode';

export const decodeJwt = (jwt: string | null = sessionStorage.getItem('jwt')) => {
  if (jwt) {
    return jwtDecode(jwt);
  } else {
    return undefined;
  }
};

export const getTokenExpiryTime = (): number => {
  const currentTime = Math.floor(Date.now() / 1000);
  const decodedJwt = decodeJwt();
  if (decodedJwt && decodedJwt.exp) {
    return decodedJwt.exp;
  } else {
    return currentTime;
  }
};

export const isTokenExpired = (minOffset: number = 0): boolean => {
  const currentTime = Math.floor(Date.now() / 1000) + minOffset * 60;
  return currentTime >= getTokenExpiryTime();
};
