import { Schema, model } from 'mongoose';

interface IUser {
    userId?: string;
    username: string;
    password: string;
    pushover_id?: string;
    pushover_token?: string;
    enabled: string;
    isAdmin?: string;
    
}

const userSchema = new Schema<IUser>({
    userId: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pushover_id: { type: String },
    pushover_token: { type: String },
    enabled: { type: String, required: true },
    isAdmin: { type: Boolean, required: true }    
});

export const User = model<IUser>('users', userSchema);


// interface User {
//   _id?: ObjectId;
//   username: string;
//   password: string;
//   pushover_id?: string;
//   pushover_token?: string;
//   enabled: string;
//   isAdmin: boolean;
// }