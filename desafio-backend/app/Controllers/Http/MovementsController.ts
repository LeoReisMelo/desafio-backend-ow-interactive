//All dependency imports
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import * as path from 'path';
import * as csv from 'csv-writer';
import {
	AllMovement,
	CreateMovement,
	FindMovement,
	Last30Days,
} from 'App/repositories/MovementsRepositorie';
import { FindUser } from 'App/repositories/UsersRepositorie';
import CustomException from 'App/utils/errors/errors';
import moment from 'moment';

//Controller for movements
export default class MovementsController {
	//Create movement
	public async create({ request }: HttpContextContract) {
		//Destructuring the request variables
		const { operation, value, userId } = request.only(['operation', 'value', 'userId']);
		//Calling the function to find user in the database
		const user = await FindUser(userId);

		//Throw exceptions
		if (!user) {
			throw CustomException('User not found', 404);
		}
		if (operation !== 'Credit' && operation !== 'Debt' && operation !== 'Reversal') {
			throw CustomException('Invalid option, Valid: Credit or Debt or Reversal ', 409);
		}
		if (value <= 0) {
			throw CustomException('Null or negative value', 409);
		}

		//Creating movement object
		const movementObject = {
			operation,
			value,
			user_id: userId,
		};
		//Calling the function to create the movement in the database
		const movement = await CreateMovement(movementObject);

		//Returning movement data
		return movement;
	}

	//Get all users
	public async index() {
		//Calling the function to get all movements in the database
		const all = await AllMovement();
		//Creating array to store object data
		const arrayReturn: Array<JSON> = [];
		//Creating object to store user and movement information
		const objectReturn = {
			item: {
				movement: {},
				user: {},
			},
		};

		//Sweeping data from movements
		for (let i = 0; i < all.length; i++) {
			//Calling the function to user movement in the database
			const user = await FindUser(all[i].user_id);
			//Calling the function to find movement in the database
			const movement = await FindMovement(all[i].id);

			//Setting object items
			objectReturn.item.movement = { movement };
			objectReturn.item.user = { user };

			//Setting array objects
			arrayReturn.push(JSON.parse(JSON.stringify(objectReturn)));
		}

		//Returning array data
		return arrayReturn;
	}

	//Find movement
	public async findMovement({ request }: HttpContextContract) {
		//Destructuring the request variables from query params
		const { id } = request.qs();
		//Creating object to store user and movement information
		const objectReturn = {
			item: {
				movement: {},
				user: {},
			},
		};
		//Calling the function to find movement in the database
		const movement = await FindMovement(id);

		//Throw exception
		if (!movement) {
			throw CustomException('Movement not found', 404);
		}

		//Calling the function to find user in the database
		const user = await FindUser(movement?.user_id || 0);

		//Throw exception
		if (!user) {
			throw CustomException('Invalid movement, no associated user', 500);
		}

		//Setting object items
		objectReturn.item.movement = { movement };
		objectReturn.item.user = { user };

		//Returning object whit the items
		return objectReturn;
	}

	//Delete movement
	public async deleteMovement({ request, response }: HttpContextContract) {
		//Destructuring the request variables from query params
		const { id } = request.qs();
		//Calling the function to find movement in the database
		const movement = await FindMovement(id);

		//Throw exceptions
		if (!movement) {
			throw CustomException('Movement not found', 404);
		}

		//Deleting user
		await movement.delete();

		//Returning delete message
		return response.json({ message: 'Movement deleted successfully' });
	}

	//Creating CSV file
	public async createCsvFile({ request }: HttpContextContract) {
		//Destructuring the request variables from body
		const { filter } = request.body();

		//Checking the filter type
		if (filter === 'all') {
			//Creating array for recordings
			let records: Array<JSON> = [];
			//Calling the function to get all movements in the database
			const all = await AllMovement();
			//Creating array to store object data
			const arrayReturn: Array<JSON> = [];
			//Creating object to store user and movement information
			const objectReturn = {
				item: {
					movement: {},
					user: {},
				},
			};

			//Sweeping data from movements
			for (let i = 0; i < all.length; i++) {
				//Calling the function to find user in the database
				const user = await FindUser(all[i].user_id);
				//Calling the function to find movement in the database
				const movement = await FindMovement(all[i].id);

				//Setting object items
				objectReturn.item.movement = { movement };
				objectReturn.item.user = { user };

				//Setting array objects
				arrayReturn.push(JSON.parse(JSON.stringify(objectReturn)));
			}

			//Creating CSV object
			const csvWriter = csv.createObjectCsvWriter({
				path: path.resolve(__dirname, '..', '..', 'csv', 'fileAllMovements.csv'),
				header: [
					{ id: 'id', title: 'ID' },
					{ id: 'operation', title: 'OPERATION' },
					{ id: 'value', title: 'VALUE' },
					{ id: 'user_id', title: 'USER_ID' },
					{ id: 'name', title: 'NAME' },
					{ id: 'email', title: 'EMAIL' },
				],
			});

			//Sweeping data from array whit objects
			for (let i = 0; i < arrayReturn.length; i++) {
				//Destructuring the variables from array whit objects for movements
				// eslint-disable-next-line @typescript-eslint/naming-convention
				const { id, operation, value, user_id } = arrayReturn[i].item.movement.movement;
				//Destructuring the request variables from array whit objects for users
				const { name, email } = arrayReturn[i].item.user.user;
				//Creating object to store csv information
				const recordObject = {
					id,
					operation,
					value,
					user_id,
					name,
					email,
				};

				//Setting records informations
				records.push(JSON.parse(JSON.stringify(recordObject)));
			}

			//Creating csv file
			const result = csvWriter.writeRecords(records).then(() => {
				return JSON.parse(
					JSON.stringify({ message: 'Arquivo CSV, com todas as movimentações, gerado com sucesso' })
				);
			});

			//Return message
			return result;
		}
		//Checking the filter type
		if (filter === 'last30Days') {
			//Creating array for recordings
			let records: Array<JSON> = [];
			const movements = await Last30Days();
			//Creating array to store object data
			const arrayReturn: Array<JSON> = [];
			//Creating object to store user and movement information
			const objectReturn = {
				item: {
					movement: {},
					user: {},
				},
			};

			//Sweeping data from movements
			for (let i = 0; i < movements.length; i++) {
				//Calling the function to find user in the database
				const user = await FindUser(movements[i].user_id);
				//Calling the function to find movement in the database
				const movement = await FindMovement(movements[i].id);

				//Setting object items
				objectReturn.item.movement = { movement };
				objectReturn.item.user = { user };

				//Setting array objects
				arrayReturn.push(JSON.parse(JSON.stringify(objectReturn)));
			}

			//Creating CSV object
			const csvWriter = csv.createObjectCsvWriter({
				path: path.resolve(__dirname, '..', '..', 'csv', 'fileLast30Days.csv'),
				header: [
					{ id: 'id', title: 'ID' },
					{ id: 'operation', title: 'OPERATION' },
					{ id: 'value', title: 'VALUE' },
					{ id: 'user_id', title: 'USER_ID' },
					{ id: 'name', title: 'NAME' },
					{ id: 'email', title: 'EMAIL' },
				],
			});

			//Sweeping data from array whit objects
			for (let i = 0; i < arrayReturn.length; i++) {
				//Destructuring the variables from array whit objects for movements
				// eslint-disable-next-line @typescript-eslint/naming-convention
				const { id, operation, value, user_id } = arrayReturn[i].item.movement.movement;
				//Destructuring the request variables from array whit objects for users
				const { name, email } = arrayReturn[i].item.user.user;
				//Creating object to store csv information
				const recordObject = {
					id,
					operation,
					value,
					user_id,
					name,
					email,
				};

				//Setting records informations
				records.push(JSON.parse(JSON.stringify(recordObject)));
			}

			//Creating csv file
			const result = csvWriter.writeRecords(records).then(() => {
				return JSON.parse(
					JSON.stringify({
						message:
							'Arquivo CSV, com todas as movimentações dos ultimos 30 dias, gerado com sucesso',
					})
				);
			});

			//Return message
			return result;
		}
		//Checking the filter type
		if (filter === 'monthAndYear') {
			//Creating array for recordings
			let records: Array<JSON> = [];
			//Creating array for movements dates
			let fullMovementDate: Array<String> = [];
			//Destructuring the variables from request body
			const { monthAndYear } = request.body();
			//Creating array to store object data
			const arrayReturn: Array<JSON> = [];
			//Creating object to store user and movement information
			const objectReturn = {
				item: {
					movement: {},
					user: {},
				},
			};
			//Separating the month from the year
			const [month, year] = monthAndYear.split('/', 2);
			//Converting the month to number
			const formatedNumber = Number(month);
			//Converting to moment format
			const date = moment()
				.month(Number(formatedNumber - 1))
				.year(Number(`20${year}`))
				.format('MM/YYYY');
			//Calling the function to get all movements in the database
			const movements = await AllMovement();
			//Getting the dates of the moves
			const createdAts = movements.map((movement) => {
				return movement.createdAt;
			});

			//Mapping the dates
			createdAts.map((createdAt) => {
				//Setting dates
				fullMovementDate.push(`${createdAt.month}/${createdAt.year}`);
			});

			//Sweeping data from movements dates
			for (let i = 0; i < fullMovementDate.length; i++) {
				if (date === fullMovementDate[i]) {
					//Calling the function to find user in the database
					const user = await FindUser(movements[i].user_id);
					//Calling the function to find movement in the database
					const movement = await FindMovement(movements[i].id);

					//Setting object items
					objectReturn.item.movement = { movement };
					objectReturn.item.user = { user };

					//Setting array objects
					arrayReturn.push(JSON.parse(JSON.stringify(objectReturn)));
				}
			}

			//Creating CSV object
			const csvWriter = csv.createObjectCsvWriter({
				path: path.resolve(__dirname, '..', '..', 'csv', `file${month}_${year}.csv`),
				header: [
					{ id: 'id', title: 'ID' },
					{ id: 'operation', title: 'OPERATION' },
					{ id: 'value', title: 'VALUE' },
					{ id: 'user_id', title: 'USER_ID' },
					{ id: 'name', title: 'NAME' },
					{ id: 'email', title: 'EMAIL' },
				],
			});

			//Sweeping data from array whit objects
			for (let i = 0; i < arrayReturn.length; i++) {
				//Destructuring the variables from array whit objects for movements
				// eslint-disable-next-line @typescript-eslint/naming-convention
				const { id, operation, value, user_id } = arrayReturn[i].item.movement.movement;
				//Destructuring the request variables from array whit objects for users
				const { name, email } = arrayReturn[i].item.user.user;
				//Creating object to store csv information
				const recordObject = {
					id,
					operation,
					value,
					user_id,
					name,
					email,
				};

				//Setting records informations
				records.push(JSON.parse(JSON.stringify(recordObject)));
			}

			//Creating csv file
			const result = csvWriter.writeRecords(records).then(() => {
				return JSON.parse(
					JSON.stringify({
						message: `Arquivo CSV, com todas as movimentações de: ${date}, gerado com sucesso`,
					})
				);
			});

			//Return message
			return result;
		}
	}
}
