import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('correo', 120).notNullable().unique()
      table.string('password', 500).notNullable()
      table.string('telefono', 10).notNullable()
      table.enum('estatus', [1, 0]).defaultTo(0)
      table.string('codigo_verificacion', 10).nullable()
      table.integer('rol_id').unsigned().references('roles.id').onUpdate('CASCADE')
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
