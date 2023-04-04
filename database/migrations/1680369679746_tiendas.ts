import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tiendas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('key', 120).notNullable().unique()
      table.string('nombre', 100).notNullable()
      table.string('code', 10).notNullable()
      table.integer('user_id').unsigned().references('users.id').onUpdate('CASCADE')
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
