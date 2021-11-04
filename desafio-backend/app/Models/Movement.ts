//All dependency imports
import { DateTime } from 'luxon';
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import User from './User';

//Movement model
export default class Movement extends BaseModel {
	@column({ isPrimary: true })
	public id: number;

	@column()
	public operation: string;

	@column()
	public value: number;

	@column()
	public user_id: number;

	@hasOne(() => User)
	public user: HasOne<typeof User>;

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime;
}

Movement.$getRelation('user').relatedModel()
