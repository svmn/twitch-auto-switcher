export interface GetUsersResponse {
  _total: number;
  users: User[];
}

interface User {
  display_name: string;
  _id: string;
  name: string;
  type: string;
  bio: string;
  created_at: Date;
  updated_at: Date;
  logo: string;
}
