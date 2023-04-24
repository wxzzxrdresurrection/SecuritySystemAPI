import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SensorMongo from 'App/Models/SensorMongo'
import SensorValorMongo from 'App/Models/SensorValor'
import Tienda from 'App/Models/Tienda';
import { schema, rules } from '@ioc:Adonis/Core/Validator'

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

  public async getValues({response}: HttpContextContract){

      const sensor = await SensorValorMongo.aggregate([ {
        '$lookup': {
          'from': 'sensores',
          'localField': 'sensor.id_casa',
          'foreignField': 'id_casa',
          'as': 'sensores'
        }
      }, {
        '$unwind': {
          'path': '$sensores'
        }
      }, {
        '$match': {
          'sensores.id_casa': 1
        }
      }, {
        '$sort': {
          'fecha': -1
        }
      }, {
        '$group': {
          '_id': '$sensor.identificador',
          'tipo': {
            '$first': '$sensor.tipo'
          },
          'descripcion': {
            '$first': '$sensor.descripcion'
          },
          'valor': {
            '$first': '$valor'
          },
          'fecha': {
            '$first': '$fecha'
          }
        }
      }])

      if(!sensor){
        return response.status(404).json({
          status: 404,
          message: 'Sensor no encontrado',
          error: 'Sensor no encontrado',
          data: null
        })
      }

      return sensor

  }

  public async getSensoresByTienda({response, params}: HttpContextContract){
    const tienda = await Tienda.find(params.id)

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const sensores = await SensorMongo.find({id_casa: tienda.id})

    if(sensores.length === 0){
      return response.status(404).json({
        status: 404,
        message: 'Sensores no encontrados',
        error: 'Sensores no encontrados',
        data: null
      })
    }

    return sensores

  }

  public async getSensorTempValue({request,response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        tienda_id: schema.number([rules.exists({table: 'tiendas', column: 'id'})]),
      })
    })

    const tienda = await Tienda.find(request.input('tienda_id'))

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const sensor = await SensorValorMongo.aggregate([
      {
        '$lookup': {
          'from': 'tiendas',
          'localField': 'sensor.id_casa',
          'foreignField': 'altId',
          'as': 'tienda'
        }
      }, {
        '$unwind': {
          'path': '$tienda'
        }
      }, {
        '$match': {
          'tienda.altId': tienda.id,
          'sensor.tipo': 'TEMPERATURA'
        }
      }, {
        '$sort': {
          'fecha': -1
        }
      }, {
        '$group': {
          '_id': {
            'id_casa': '$sensor.id_casa',
            'identificador': '$sensor.identificador',
            'tipo': '$sensor.tipo'
          },
          'valor': {
            '$first': '$valor'
          },
          'tienda': {
            '$first': '$tienda.nombre'
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'sensor': {
            'tipo': '$_id.tipo',
            'identificador': '$_id.identificador',
            'id_casa': '$_id.id_casa'
          },
          'valor': '$valor',
          'tienda': '$tienda'
        }
      }
    ])

    if(!sensor){
      return response.status(404).json({
        status: 404,
        message: 'Sensor no encontrado',
        error: 'Sensor no encontrado',
        data: null
      })
    }

    return sensor
  }

  public async getSensorAguaValue({request,response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        tienda_id: schema.number([rules.exists({table: 'tiendas', column: 'id'})]),
      })
    })

    const tienda = await Tienda.find(request.input('tienda_id'))

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const sensor = await SensorValorMongo.aggregate([
      {
        '$lookup': {
          'from': 'tiendas',
          'localField': 'sensor.id_casa',
          'foreignField': 'altId',
          'as': 'tienda'
        }
      }, {
        '$unwind': {
          'path': '$tienda'
        }
      }, {
        '$match': {
          'tienda.altId': tienda.id,
          'sensor.tipo': 'AGUA'
        }
      }, {
        '$sort': {
          'fecha': -1
        }
      }, {
        '$group': {
          '_id': {
            'id_casa': '$sensor.id_casa',
            'identificador': '$sensor.identificador',
            'tipo': '$sensor.tipo'
          },
          'valor': {
            '$first': '$valor'
          },
          'tienda': {
            '$first': '$tienda.nombre'
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'sensor': {
            'tipo': '$_id.tipo',
            'identificador': '$_id.identificador',
            'id_casa': '$_id.id_casa'
          },
          'valor': '$valor',
          'tienda': '$tienda'
        }
      }
    ])

    if(!sensor){
      return response.status(404).json({
        status: 404,
        message: 'Sensor no encontrado',
        error: 'Sensor no encontrado',
        data: null
      })
    }

    return sensor

  }

  public async getSensorLuzValue({request,response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        tienda_id: schema.number([rules.exists({table: 'tiendas', column: 'id'})]),
      })
    })

    const tienda = await Tienda.find(request.input('tienda_id'))

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const sensor = await SensorValorMongo.aggregate([
      {
        '$lookup': {
          'from': 'tiendas',
          'localField': 'sensor.id_casa',
          'foreignField': 'altId',
          'as': 'tienda'
        }
      }, {
        '$unwind': {
          'path': '$tienda'
        }
      }, {
        '$match': {
          'tienda.altId': tienda.id,
          'sensor.tipo': 'LUZ'
        }
      }, {
        '$sort': {
          'fecha': -1
        }
      }, {
        '$group': {
          '_id': {
            'id_casa': '$sensor.id_casa',
            'identificador': '$sensor.identificador',
            'tipo': '$sensor.tipo'
          },
          'valor': {
            '$first': '$valor'
          },
          'tienda': {
            '$first': '$tienda.nombre'
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'sensor': {
            'tipo': '$_id.tipo',
            'identificador': '$_id.identificador',
            'id_casa': '$_id.id_casa'
          },
          'valor': '$valor',
          'tienda': '$tienda'
        }
      }
    ])

    if(!sensor){
      return response.status(404).json({
        status: 404,
        message: 'Sensor no encontrado',
        error: 'Sensor no encontrado',
        data: null
      })
    }

    return sensor

  }

  public async getSensorMovimientoValue({request,response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        tienda_id: schema.number([rules.exists({table: 'tiendas', column: 'id'})]),
      })
    })

    const tienda = await Tienda.find(request.input('tienda_id'))

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const sensor = await SensorValorMongo.aggregate([
      {
        '$lookup': {
          'from': 'tiendas',
          'localField': 'sensor.id_casa',
          'foreignField': 'altId',
          'as': 'tienda'
        }
      }, {
        '$unwind': {
          'path': '$tienda'
        }
      }, {
        '$match': {
          'tienda.altId': tienda.id,
          'sensor.tipo': 'MOVIMIENTO'
        }
      }, {
        '$sort': {
          'fecha': -1
        }
      }, {
        '$group': {
          '_id': {
            'id_casa': '$sensor.id_casa',
            'identificador': '$sensor.identificador',
            'tipo': '$sensor.tipo'
          },
          'valor': {
            '$first': '$valor'
          },
          'tienda': {
            '$first': '$tienda.nombre'
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'sensor': {
            'tipo': '$_id.tipo',
            'identificador': '$_id.identificador',
            'id_casa': '$_id.id_casa'
          },
          'valor': '$valor',
          'tienda': '$tienda'
        }
      }
    ])

    if(!sensor){
      return response.status(404).json({
        status: 404,
        message: 'Sensor no encontrado',
        error: 'Sensor no encontrado',
        data: null
      })
    }

    return sensor

  }

  public async getSensorHumoValue({request, response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        tienda_id: schema.number([rules.exists({table: 'tiendas', column: 'id'})]),
      })
    })

    const tienda = await Tienda.find(request.input('tienda_id'))

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const sensor = await SensorValorMongo.aggregate([
      {
        '$lookup': {
          'from': 'tiendas',
          'localField': 'sensor.id_casa',
          'foreignField': 'altId',
          'as': 'tienda'
        }
      }, {
        '$unwind': {
          'path': '$tienda'
        }
      }, {
        '$match': {
          'tienda.altId': tienda.id,
          'sensor.tipo': 'HUMO'
        }
      }, {
        '$sort': {
          'fecha': -1
        }
      }, {
        '$group': {
          '_id': {
            'id_casa': '$sensor.id_casa',
            'identificador': '$sensor.identificador',
            'tipo': '$sensor.tipo'
          },
          'valor': {
            '$first': '$valor'
          },
          'tienda': {
            '$first': '$tienda.nombre'
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'sensor': {
            'tipo': '$_id.tipo',
            'identificador': '$_id.identificador',
            'id_casa': '$_id.id_casa'
          },
          'valor': '$valor',
          'tienda': '$tienda'
        }
      }
    ])

    if(!sensor){
      return response.status(404).json({
        status: 404,
        message: 'Sensor no encontrado',
        error: 'Sensor no encontrado',
        data: null
      })
    }


    return sensor
  }

  public async getSensorInfraValue({request, response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        tienda_id: schema.number([rules.exists({table: 'tiendas', column: 'id'})]),
      })
    })

    const tienda = await Tienda.find(request.input('tienda_id'))

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const sensor = await SensorValorMongo.aggregate([
      {
        '$lookup': {
          'from': 'tiendas',
          'localField': 'sensor.id_casa',
          'foreignField': 'altId',
          'as': 'tienda'
        }
      }, {
        '$unwind': {
          'path': '$tienda'
        }
      }, {
        '$match': {
          'tienda.altId': tienda.id,
          'sensor.tipo': 'INFRAROJO'
        }
      }, {
        '$sort': {
          'fecha': -1
        }
      }, {
        '$group': {
          '_id': {
            'id_casa': '$sensor.id_casa',
            'identificador': '$sensor.identificador',
            'tipo': '$sensor.tipo'
          },
          'valor': {
            '$first': '$valor'
          },
          'tienda': {
            '$first': '$tienda.nombre'
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'sensor': {
            'tipo': '$_id.tipo',
            'identificador': '$_id.identificador',
            'id_casa': '$_id.id_casa'
          },
          'valor': '$valor',
          'tienda': '$tienda'
        }
      }
    ])

    if(!sensor){
      return response.status(404).json({
        status: 404,
        message: 'Sensor no encontrado',
        error: 'Sensor no encontrado',
        data: null
      })
    }

    return sensor

  }

  public async getSensorDistanciaValue({request, response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        tienda_id: schema.number([rules.exists({table: 'tiendas', column: 'id'})]),
      })
    })

    const tienda = await Tienda.find(request.input('tienda_id'))

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const sensor = await SensorValorMongo.aggregate([
      {
        '$lookup': {
          'from': 'tiendas',
          'localField': 'sensor.id_casa',
          'foreignField': 'altId',
          'as': 'tienda'
        }
      }, {
        '$unwind': {
          'path': '$tienda'
        }
      }, {
        '$match': {
          'tienda.altId': tienda.id,
          'sensor.tipo': 'DISTANCIA'
        }
      }, {
        '$sort': {
          'fecha': -1
        }
      }, {
        '$group': {
          '_id': {
            'id_casa': '$sensor.id_casa',
            'identificador': '$sensor.identificador',
            'tipo': '$sensor.tipo'
          },
          'valor': {
            '$first': '$valor'
          },
          'tienda': {
            '$first': '$tienda.nombre'
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'sensor': {
            'tipo': '$_id.tipo',
            'identificador': '$_id.identificador',
            'id_casa': '$_id.id_casa'
          },
          'valor': '$valor',
          'tienda': '$tienda'
        }
      }
    ])

    if(!sensor){
      return response.status(404).json({
        status: 404,
        message: 'Sensor no encontrado',
        error: 'Sensor no encontrado',
        data: null
      })
    }

    return sensor

  }

}
