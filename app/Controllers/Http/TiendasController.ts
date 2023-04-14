import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Tienda from 'App/Models/Tienda'
import TiendaMongo from 'App/Models/TiendaMongo'
import User from 'App/Models/User'
import UserTienda from 'App/Models/UserTienda'

export default class TiendasController {
  //CALADO
  public async createTienda({ request, response }: HttpContextContract) {
    await request.validate({
      schema: schema.create({
        nombre: schema.string([rules.maxLength(100)]),
        user_id: schema.number([rules.exists({ table: 'users', column: 'id' })]),
      }),
      messages: {
        required: 'El campo {{ field }} es obligatorio',
        maxLength: 'El campo {{ field }} no puede tener más de {{ options.maxLength }} caracteres',
      },
    })

    const tienda = await Tienda.create({
      nombre: request.input('nombre'),
      code: Math.floor(Math.random() * 9000 + 1000)
    })

    const newTienda = TiendaMongo.create({
        _id: tienda.id,
        nombre: tienda.nombre,
        code: tienda.code,
    })

      if(!newTienda || !tienda) {
        return response.status(400).json({
          status: 400,
          message: 'Error al crear la tienda',
          error: null,
          data: null,
        })
      }

    const user = await User.findOrFail(request.input('user_id'))

    const tiendaUser = await UserTienda.create({
      tienda_id: tienda.id,
      user_id: user.id,
      is_owner: true,
    })

    return response.status(201).created({
      status: 201,
      message: 'Tienda creada correctamente',
      error: null,
      data: tiendaUser
    })
  }

  //CALADO
  public async allTiendas() {
    const tiendas = (await Tienda.all()).reverse()

    /*return response.status(200).json({
      status: 200,
      message: 'Tiendas obtenidas correctamente',
      error: null,
      data: tiendas,
    })*/

    return tiendas;
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

    /*return response.status(200).json({
      status: 200,
      message: 'Tienda obtenida correctamente',
      error: null,
      data: tienda,
    })*/

    return tienda;
  }

  public async updateTienda({ params, request, response }: HttpContextContract) {
    const tienda = await Tienda.find(params.id)

    if (!tienda) {
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: null,
        data: null,
      })
    }

    await request.validate({
      schema: schema.create({
        nombre: schema.string([rules.maxLength(100)]),
      }),
      messages: {
        required: 'El campo {{ field }} es obligatorio',
        maxLength: 'El campo {{ field }} no puede tener más de {{ options.maxLength }} caracteres',
      },
    })

    tienda.nombre = request.input('nombre')

    await tienda.save()

    return response.status(200).json({
      status: 200,
      message: 'Tienda actualizada correctamente',
      error: null,
      data: tienda,
    })
  }

  public async deleteTienda({ params, response }: HttpContextContract) {
    const tienda = await Tienda.find(params.id)

    if (!tienda) {
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: null,
        data: null,
      })
    }

    await tienda.delete()

    return response.status(200).json({
      status: 200,
      message: 'Tienda eliminada correctamente',
      error: null,
      data: null,
    })
  }
}
