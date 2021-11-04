//All dependency imports
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Movements extends BaseSchema {
	protected tableName = 'movements';

	//Create table
	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id');
			table.string('operation').notNullable();
			table.float('value').notNullable();
			table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE');
			table.datetime('created_at', { useTz: true }).defaultTo(this.now());
			table.datetime('updated_at', { useTz: true }).defaultTo(this.now());
		});
	}

	//Drop table
	public async down() {
		this.schema.dropTable(this.tableName);
	}
}
