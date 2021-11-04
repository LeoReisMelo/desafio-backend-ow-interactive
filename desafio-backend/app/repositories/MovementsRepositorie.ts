//All dependency
import Movement from 'App/Models/Movement';
import moment from 'moment';

//Create movement
export async function CreateMovement(data) {
	return await Movement.create(data);
}

//Find movement by id
export async function FindMovement(id: number) {
	return await Movement.find(id);
}

//Find movement by user id
export async function FindByMovement(id: number) {
	return await Movement.findBy('user_id', id);
}

//Get all movements
export async function AllMovement() {
	return await Movement.all();
}

//Function to find all movements of the last 30 days
export async function Last30Days() {
	const days = moment().subtract({ d: 30 }).format('X');
	const movements = await Movement.query().select('*').where('created_at', '>', `${days}`);

	return movements;
}

//Function to sum all movements values
export async function SumAllMovements(user_id: string) {
	const movements = await Movement.query().select('*').where('user_id', '=', `${user_id}`);

	return movements;
}
