//All dependency imports
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import CustomException from 'App/utils/errors/errors';
import { AllUser, CreateUser, FindByEmailUser, FindUser } from 'App/repositories/UsersRepositorie';
import { FindByMovement, SumAllMovements } from 'App/repositories/MovementsRepositorie';

//Controller for users
export default class UsersController {
	//Create user
	public async create({ request }: HttpContextContract) {
		//Destructuring the request variables
		const { name, email, birthday, age } = request.only(['name', 'email', 'birthday', 'age']);
		//Validating email
		const regexEmail =
			/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		//Validating birthday
		const regexBirthday = /^(?:0[1-9]|[12]\d|3[01])([\/.-])(?:0[1-9]|1[012])\1(?:19|20)\d\d$/;
		//Find user by email
		const findByEmailUser = await FindByEmailUser(email);

		//Throw exceptions
		if (findByEmailUser) {
			throw CustomException('Email already exists', 409);
		}
		if (!regexBirthday.test(birthday)) {
			throw CustomException('Birthday date is invalid', 409);
		}
		if (!regexEmail.test(email)) {
			throw CustomException('Email address is invalid', 409);
		}
		if (age < 18) {
			throw CustomException('Only over 18 can create an account', 400);
		}

		//Creating user object
		const userObject = {
			name,
			email,
			birthday,
			age,
			openingBalance: 0,
		};
		//Calling the function to create the user in the database
		const user = await CreateUser(userObject);

		//Returning user data
		return user;
	}

	//Get all users
	public async index() {
		//Calling the function to get all users in the database
		const all = await AllUser();

		//Returning users data
		return all;
	}

	//Find user
	public async findUser({ request }: HttpContextContract) {
		//Destructuring the request variables from query params
		const { id } = request.qs();
		//Calling the function to find user in the database
		const user = await FindUser(id);

		//Throw exception
		if (!user) {
			throw CustomException('User not found', 404);
		}

		//Returning users data
		return user;
	}

	//Delete user
	public async deleteUser({ request, response }: HttpContextContract) {
		//Destructuring the request variables from query params
		const { id } = request.qs();
		//Calling the function to find user in the database
		const user = await FindUser(id);
		//Calling the function to find movement by user_id in the database
		const movement = await FindByMovement(id);

		//Throw exceptions
		if (!user) {
			throw CustomException('User not found', 404);
		}
		if (movement) {
			throw CustomException('User cannot be deleted because has a move', 500);
		}
		if (user.openingBalance > 0) {
			throw CustomException('User cannot be deleted because have a balance', 500);
		}

		//Deleting user
		await user.delete();

		//Returning delete message
		return response.json({ message: 'User deleted successfully' });
	}

	//Add balance
	public async addBalance({ request }: HttpContextContract) {
		//Destructuring the request variables from body
		const { value, userId } = request.body();
		//Calling the function to find user in the database
		const user = await FindUser(userId);

		//Throw exception
		if (!user) {
			throw CustomException('User not found', 404);
		}

		//Adding value to opening balance
		user.openingBalance += Number(value);

		//Returning users data
		return await user.save();
	}

	//Withdraw balance
	public async withdrawBalance({ request }: HttpContextContract) {
		//Destructuring the request variables from body
		const { value, userId } = request.body();
		//Calling the function to find user in the database
		const user = await FindUser(userId);

		//Throw exceptions
		if (!user) {
			throw CustomException('User not found', 404);
		}
		if (user.openingBalance <= 0) {
			throw CustomException('Null or negative balance', 409);
		}

		//Withdrawing value to opening balance
		user.openingBalance -= Number(value);

		//Returning users data
		return await user.save();
	}

	//Adding all movement values
	public async sumAllMovements({ request, response }: HttpContextContract) {
		//Destructuring the request variables from query params
		const { id } = request.qs();
		//Calling the function to find user in the database
		const user = await FindUser(id);
		//Calling the function to get all user movements
		const userMovements = await SumAllMovements(id);
		//Taking the values of movements
		const values = userMovements.map((movement) => {
			return movement.value;
		});
		//Creating a totalValue
		let totalValue = 0;

		//Throw exceptions
		if (!user) {
			throw CustomException('User not found', 404);
		}

		//Sweeping the values
		for (let i = 0; i < values.length; i++) {
			totalValue += values[i];
		}

		//Returning json whit message and totalValue
		return response.json({
			message: `O valor total das movimentações do usuário, mais seu saldo inicial é de R$: ${Number(
				user?.openingBalance + totalValue
			).toFixed(2)}`,
		});
	}
}
