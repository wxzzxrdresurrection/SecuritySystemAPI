import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Invitacione extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public owner_id: number

  @column()
  public invitado_id: number

  @column()
  public tienda_id: number

  @column()
  public fecha: string
}
