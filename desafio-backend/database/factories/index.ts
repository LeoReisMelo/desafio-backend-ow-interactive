//All dependency imports
import Factory from '@ioc:Adonis/Lucid/Factory';
import Movement from 'App/Models/Movement';
import User from 'App/Models/User';
import moment from 'moment';

//Min and Max values
const min = Math.ceil(1);
const max = Math.floor(100);

//User factory(seed)
export const UserFactory = Factory.define(User, ({ faker }) => {
	return {
		name: faker.internet.userName(),
		email: faker.internet.email(),
		age: 18,
		birthday: moment().format('DD/MM/YYYY'),
		openingBalance: 0,
	};
}).build();

//Movement factory(seed)
export const MovementsFactory = Factory.define(Movement, () => {
	return {
		operation: 'Credit',
		value: Number(Math.floor(Math.random() * (min + max) - min).toFixed(2)),
		user_id: 1,
	};
}).build();
