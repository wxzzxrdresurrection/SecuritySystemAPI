import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema } from '@ioc:Adonis/Core/Validator'
import Tienda from 'App/Models/Tienda'
import UserTienda from 'App/Models/UserTienda'
import Invitacione from 'App/Models/Invitacione'
import { DateTime } from 'luxon'

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

  public async getOwners({response}: HttpContextContract){
    const owners = await UserTienda.query().where('is_owner', true)

    if(!owners){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado',
        data: null
      })
    }

    return owners;
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

  public async getGuests({params, response} :HttpContextContract){

    const guests = await UserTienda.query().where('tienda_id', params.id)

    const users = await User.query().whereNotIn('id', guests.map((guest) => guest.user_id)).andWhere('rol_id', 3)

    if(!users){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado',
        data: null
      })
    }

    return users;
  }

  public async misTiendasToken({auth, response}: HttpContextContract){
    const user = await auth.use('api').authenticate()

    const tiendas = await UserTienda.query().where('user_id', user.id).andWhere('is_owner', true)

    if(!tiendas){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado',
        data: null
      })
    }

    return tiendas
  }

  public async invitarAMisTiendas({request, response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        owner_id : schema.number(),
        tienda_id : schema.number(),
        guest_id : schema.number(),
      })
    })

    const owner = await User.find(request.input('owner_id'))

    if(!owner){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado',
        data: null
      })
    }

    const tienda = await Tienda.find(request.input('tienda_id'))

    if(!tienda){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no encontrada',
        error: 'Tienda no encontrada',
        data: null
      })
    }

    const guest = await User.find(request.input('guest_id'))

    if(!guest){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado',
        data: null
      })
    }

    const tiendaUser = await UserTienda.query().where('tienda_id', tienda.id).andWhere('user_id', owner.id).andWhere('is_owner', true)

    if(!tiendaUser){
      return response.status(404).json({
        status: 404,
        message: 'Tienda no válida',
        error: 'Tienda no válida',
        data: null
      })
    }

    const invitado = await UserTienda.query().where('tienda_id', tienda.id).andWhere('user_id', guest.id).andWhere('is_owner', false)

    if(invitado){
      return response.status(404).json({
        status: 404,
        message: 'Usuario ya es invitado',
        error: 'Usuario ya es invitado',
        data: null
      })
    }

    const invitacion = await Invitacione.create({
      owner_id: owner.id,
      invitado_id: guest.id,
      tienda_id: tienda.id,
      fecha: DateTime.now().toFormat('yyyy-MM-dd'),
    })

    return response.status(201).json({
      status: 201,
      message: 'Invitación enviada correctamente',
      error: null,
      data: invitacion
    })


  }

}


