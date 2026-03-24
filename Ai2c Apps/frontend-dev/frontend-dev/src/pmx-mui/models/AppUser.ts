/**
 * @typedef Preferences
 * @prop { string } mode
 */
export interface Preferences {
  mode: string;
}

/**
 * @typedef People
 * @prop { string } userId
 * @prop { string } firstName
 * @prop { string } lastName
 * @prop { string } rank
 * @prop { boolean } isAdmin
 * @prop { string } [email]
 * @prop { string } [preferences]
 * @prop { string } [unit]
 * @prop { string } [initials]
 */
export interface AppUser {
  userId: string;
  firstName: string;
  lastName: string;
  rank: string;
  isAdmin?: boolean;
  email?: string;
  preferences?: Preferences;
  unit?: string;
  initials?: string;
}
