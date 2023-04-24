import { DateTime } from 'luxon'
import { BaseModel, ManyToMany, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Tienda from './Tienda'

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
  public estatus: string

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

  @manyToMany(() => Tienda,{
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'tienda_id',
    pivotTable: 'users_tiendas',
    pivotTimestamps: true,

  })
  public tiendas: ManyToMany<typeof Tienda>
}
