import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'info_users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 100).notNullable()
      table.string('ap_paterno', 60).notNullable()
      table.string('ap_materno', 60).notNullable()
      table.enum('sexo',['Masculino','Femenino']).notNullable()
      table.string('fecha_nacimiento').notNullable()
      table.integer('pregunta_id').unsigned().references('preguntas.id').onUpdate('CASCADE')
      table.string('respuesta', 100).notNullable()
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
