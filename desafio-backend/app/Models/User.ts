//All dependency imports
import { DateTime } from 'luxon';
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm';
import Movement from './Movement';

//User model
export default class User extends BaseModel {
	@column({ isPrimary: true })
	public id: number;

	@column()
	public name: string;

	@column()
	public email: string;

	@column()
	public birthday: Date;

	@column()
	public age: number;

	@column()
	public openingBalance: number;

	@hasMany(() => Movement)
	public movements: HasMany<typeof Movement>;

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime;
}
