import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nombre: string

  @column()
  public ap_paterno: string

  @column()
  public ap_materno: string

  @column()
  public correo: string

  @column()
  public password: string

  @column()
  public telefono: string

  @column()
  public estatus: number

  @column()
  public codigo_verificacion: string

  @column()
  public rol_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
