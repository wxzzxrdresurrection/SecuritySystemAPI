import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Peticione extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public mensaje: string

  @column()
  public estado: boolean

  @column()
  public fecha: string
}
