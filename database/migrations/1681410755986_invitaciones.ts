import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'invitaciones'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('owner_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('invitado_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('tienda_id').unsigned().references('tiendas.id')
      table.string("fecha")
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
