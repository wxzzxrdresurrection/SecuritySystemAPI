import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Pregunta from 'App/Models/Pregunta'

export default class extends BaseSeeder {
  public async run () {
    await Pregunta.createMany([
      { pregunta: '¿Cuál era el nombre de tu primer mascota?' },
      { pregunta: '¿Cuál es tu película favorita?' },
      { pregunta: '¿Cuál era el apodo de tu infancia?' },
      { pregunta: '¿Cuál es tu animal favorito?' },
      { pregunta: '¿Cuál es el nombre de tu primera pareja?' },
    ])
  }
}
