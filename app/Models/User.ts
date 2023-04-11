import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  public static table = 'users'

  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public correo: string

  @column({ serializeAs: null})
  public password: string

  @column()
  public telefono: string

  @column()
  public info_user_id: number

  @column()
  public estatus: number

  @column()
  public pregunta_id: number

  @column()
  public respuesta: string

  @column()
  public codigo_verificacion: string

  @column()
  public rol_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
