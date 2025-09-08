export interface UserAttributes {
    id: number;
    fullName: string;
    email: string;
    role: 'user' | 'local_body';
    password: string;
}

export interface UserAttributesDto {
    fullName: string;
    email: string;
    role: 'user' | 'local_body';
    password: string;
    confirmPassword: string;
}

export interface UserLoginDto {
    email: string;
    password: string;
}