//All dependency imports
import User from 'App/Models/User';

//Create user
export async function CreateUser(data) {
	return await User.create(data);
}

//Find user by email
export async function FindByEmailUser(email: string) {
	return await User.findBy('email', email);
}

//Find user by id
export async function FindUser(id: number) {
	return await User.find(id);
}

//Get all users
export async function AllUser() {
	return await User.all();
}
