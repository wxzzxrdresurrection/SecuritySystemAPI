import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SensorMongo from 'App/Models/SensorMongo'
import TiendaMongo from 'App/Models/TiendaMongo';
import Tienda from 'App/Models/Tienda';

export default class SensorsController {

  public async alternateSensor({request, response} :HttpContextContract){

    const sensores = request.input('invitados');

    for (let i = 0; i < sensores.length; i++) {
      const sensor = SensorMongo.find(sensores[i].id)

      if(!sensor){
        return response.status(404).json({
          status: 404,
          message: 'Sensor no encontrado',
          error: 'Sensor no encontrado',
          data: null
        })
      }

    }
  }

  public async getTiendaSensores({response,params}: HttpContextContract){

    const tienda = await Tienda.find(params.id)

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const sensoresTienda = await SensorMongo.find({tienda_id : tienda.id})

    if(!sensoresTienda){
      return response.status(404).json({
        status: 404,
        message: 'Sensores no encontrados',
        error: 'Sensores no encontrados',
        data: null
      })
    }

    return response.status(200).json({
      status: 200,
      message: 'Sensores de la tienda',
      error: null,
      data: sensoresTienda
    })

  }

  public async allSensores({response}: HttpContextContract){

      const sensores = await SensorMongo.find()

      if(!sensores){
        return response.status(404).json({
          status: 404,
          message: 'Sensores no encontrados',
          error: 'Sensores no encontrados',
          data: null
        })
      }

      return response.status(200).json({
        status: 200,
        message: 'Sensores',
        error: null,
        data: sensores
      })
  }

  public async showSensores({request, response}: HttpContextContract){

    const sensores = request.input('sensores');

    return response.status(200).json({
      status: 200,
      message: 'Sensores',
      error: null,
      data: sensores
    })

  }

  
}
