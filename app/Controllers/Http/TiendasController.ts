import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Tienda from 'App/Models/Tienda'
import TiendaMongo from 'App/Models/TiendaMongo'

export default class TiendasController {
  //CALADO
  public async createTienda({ request, response }: HttpContextContract) {
    await request.validate({
      schema: schema.create({
        nombre: schema.string([rules.maxLength(100)]),
        user_id: schema.number([rules.required()]),
      }),
      messages: {
        required: 'El campo {{ field }} es obligatorio',
        maxLength: 'El campo {{ field }} no puede tener más de {{ options.maxLength }} caracteres',
      },
    })

    const tienda = await Tienda.create({
      nombre: request.input('nombre'),
      code: Math.floor(Math.random() * 9000 + 1000),
      user_id: request.input('user_id'),
    })

    const newTienda = TiendaMongo.create({
        nombre: tienda.nombre,
        code: tienda.code,
        user_id: tienda.user_id
    })

      if(!newTienda || !tienda) {
        return response.status(400).json({
          status: 400,
          message: 'Error al crear la tienda',
          error: null,
          data: null,
        })
      }

    return response.status(201).created({
      status: 201,
      message: 'Tienda creada correctamente',
      error: null,
      data: tienda,
    })
  }
  //CALADO
  public async allTiendas({ response }: HttpContextContract) {
    const tiendas = (await Tienda.all()).reverse()

    return response.status(200).json({
      status: 200,
      message: 'Tiendas obtenidas correctamente',
      error: null,
      data: tiendas,
    })
  }

  public async getTienda({ params, response }: HttpContextContract) {
    const tienda = await Tienda.find(params.id)

    if (!tienda) {
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: null,
        data: null,
      })
    }

    return response.status(200).json({
      status: 200,
      message: 'Tienda obtenida correctamente',
      error: null,
      data: tienda,
    })
  }
}
