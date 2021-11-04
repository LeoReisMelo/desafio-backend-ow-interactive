//All dependency imports
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Users extends BaseSchema {
	protected tableName = 'users';

	//Create table
	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id');
			table.string('name').notNullable();
			table.string('email').notNullable().unique();
			table.integer('age').notNullable();
			table.float('opening_balance').notNullable();
			table.date('birthday').notNullable();
			table.datetime('created_at', { useTz: true }).defaultTo(this.now());
			table.datetime('updated_at', { useTz: true }).defaultTo(this.now());
		});
	}

	//Drop table
	public async down() {
		this.schema.dropTable(this.tableName);
	}
}
