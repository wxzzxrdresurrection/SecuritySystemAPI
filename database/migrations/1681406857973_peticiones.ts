import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'peticiones'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onUpdate('CASCADE').onDelete('CASCADE').notNullable()
      table.string('mensaje').nullable()
      table.boolean('estado').nullable()
      table.string("fecha").notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
