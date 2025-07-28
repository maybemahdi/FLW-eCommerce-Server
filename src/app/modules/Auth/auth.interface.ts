export interface ICreateUser {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface ILoginUser {
    email: string;
    password: string;
}