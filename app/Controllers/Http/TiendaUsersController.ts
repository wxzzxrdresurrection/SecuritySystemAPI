import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema } from '@ioc:Adonis/Core/Validator'
import Tienda from 'App/Models/Tienda'
import UserTienda from 'App/Models/UserTienda'

export default class TiendaUsersController {

  public async insertUser({request, response}: HttpContextContract){
   await request.validate({
      schema: schema.create({
        codigo : schema.string(),
        user_id : schema.number(),
      }),
      messages: {
        'codigo.required': 'El codigo es requerido',
        'user_id.required': 'El id del usuario es requerido',
      }
   })

   const user = await User.find(request.input('user_id'))

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado',
        data: null
      })
    }

    const tienda = await Tienda.findBy('code',request.input('codigo'))

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const tiendaUser = await UserTienda.create({
      tienda_id: tienda?.id,
      user_id: user.id,
      is_owner: false,
    })

    if(!tiendaUser){
      return response.status(400).json({
        status: 400,
        message: 'Error al agregar usuario a la tienda',
        error: null,
        data: null,
      })
    }

    return response.status(201).json({
      status: 201,
      message: 'Usuario agregado a la tienda correctamente',
      error: null,
      data: tiendaUser
    })


  }

  public async getInvitaciones({params, response}: HttpContextContract){
    const invitados = await UserTienda.query().where('tienda_id', params.id)

    if(!invitados){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado',
        data: null
      })
    }

    return invitados;
  }

  public async addInvitado({request, response}: HttpContextContract){
    await request.validate({
      schema: schema.create({
        user_id : schema.number(),
        tienda_id : schema.number(),
      }),
      messages: {
        'user_id.required': 'El id del usuario es requerido',
        'tienda_id.required': 'El id de la tienda es requerido',
      }
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

    const user = await User.find(request.input('user_id'))

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado',
        data: null
      })
    }

    const tiendaUser = await UserTienda.create({
      tienda_id: tienda.id,
      user_id: user.id,
      is_owner: false,
    })

    if(!tiendaUser){
      return response.status(400).json({
        status: 400,
        message: 'Error al agregar usuario a la tienda',
        error: null,
        data: null,
      })
    }

    return response.status(201).json({
      status: 201,
      message: 'Usuario agregado a la tienda correctamente',
      error: null,
      data: tiendaUser
    })
  }

  public async deleteInvitados({params, request, response}: HttpContextContract){
    const tienda = await Tienda.find(params.id)

    if(!tienda)
    {
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const invitados = request.input('invitados');

    if(!invitados){
      return response.status(404).json({
        status: 404,
        message: 'No hay ningun invitado seleccionado',
        error: 'No hay ningun invitado seleccionado',
        data: null
      })
    }

    for (let i = 0; i < invitados.length; i++) {
      const invitado = await UserTienda.find(invitados[i])

      if(!invitado){
        return response.status(404).json({
          status: 404,
          message: 'Invitado no encontrado',
          error: 'Invitado no encontrado',
          data: null
        })
      }

      await invitado.delete()
    }

    return response.status(200).json({
      status: 200,
      message: 'Invitados eliminados correctamente',
      error: null,
      data: null
    })
  }
}


