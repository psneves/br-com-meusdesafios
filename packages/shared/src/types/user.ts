export interface User {
  id: string;
  handle: string;
  displayName: string;
  email: string;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  handle: string;
  displayName: string;
}
