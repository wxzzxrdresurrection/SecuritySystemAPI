import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import InfoUser from 'App/Models/InfoUser'
import Hash from '@ioc:Adonis/Core/Hash'


export default class extends BaseSeeder {
  public async run () {
    await InfoUser.createMany([
      {
        "nombre" : "Luis Angel",
        "ap_paterno" : "Zapata",
        "ap_materno" : "Zuñiga",
        "sexo" : "Masculino",
        "fecha_nacimiento" : "2003-08-15",
        "pregunta_id" : 3,
        "respuesta" : "Pillin",
      },
    ])

    await User.createMany([
      {
        "username" : "luiszapata0815",
        "correo" : "luiszapata0815@gmail.com",
        "telefono" : "8713530073",
        "password" : await Hash.make('Luis200315'),
        "estatus" : 1,
        "info_user_id" : 1
      }
    ])
  }
}
