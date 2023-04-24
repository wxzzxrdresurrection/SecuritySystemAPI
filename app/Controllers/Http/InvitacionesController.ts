import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invitacione from 'App/Models/Invitacione'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { DateTime } from 'luxon'
import UserTienda from 'App/Models/UserTienda'
import Ws from 'App/Services/Ws'


export default class InvitacionesController {

  public async sendInvitacion({request, response}: HttpContextContract) {
    await request.validate({
      schema: schema.create({
        owner_id: schema.number([
          rules.exists({ table: 'users', column: 'id' })
        ]),
        invitado_id: schema.number([
          rules.exists({ table: 'users', column: 'id' })
        ]),
        tienda_id: schema.number([
          rules.exists({ table: 'tiendas', column: 'id' })
        ]),
      }),
      messages: {
        required: 'El campo {{ field }} es requerido',
        number: 'El campo {{ field }} debe ser un numero',
        exists: 'El campo {{ field }} no existe',
      }
    })

    Ws.io.emit('invitacion');
    if(request.input('owner_id') === request.input('invitado_id')) {
      return response.status(400).json({
        status: 400,
        message: 'No puedes invitarte a ti mismo',
        error: null,
        data: null
      })
    }

    const inv = await Invitacione.query().where('owner_id', request.input('owner_id')).andWhere('invitado_id', request.input('invitado_id')).andWhere('tienda_id', request.input('tienda_id')).first()

    if(inv) {
      return response.status(400).json({
        status: 400,
        message: 'Ya se ha enviado una invitacion',
        error: null,
        data: null
      })
    }

    const invitacion = await Invitacione.create({
      owner_id: request.input('owner_id'),
      invitado_id: request.input('invitado_id'),
      tienda_id: request.input('tienda_id'),
      fecha: DateTime.now().toFormat('yyyy-MM-dd'),
    })

    if(!invitacion) {
      return response.status(400).json({
        status: 400,
        message: 'No se pudo enviar la invitacion',
        error: null,
        data: null
      })
    }

    return response.status(201).json({
      status: 201,
      message: 'Invitacion enviada',
      error: null,
      data: invitacion
    })

  }

  public async misInvitaciones({params, response}: HttpContextContract) {
    const invitaciones = await Invitacione.query().where('invitado_id', params.id)

    if(!invitaciones) {
      return response.status(400).json({
        status: 400,
        message: 'No se pudo obtener las invitaciones',
        error: null,
        data: null
      })
    }

    return invitaciones
  }

  public async procesarInvitacion({request, response}: HttpContextContract) {
    await request.validate({
      schema: schema.create({
        invitacion_id: schema.number([
          rules.exists({ table: 'invitaciones', column: 'id' })
        ]),
        respuesta: schema.boolean()
      }),
      messages: {
        required: 'El campo {{ field }} es requerido',
        number: 'El campo {{ field }} debe ser un numero',
        exists: 'El campo {{ field }} no existe',
      }
    })

    const invitacion = await Invitacione.findOrFail(request.input('invitacion_id'))

    if(!invitacion) {
      return response.status(400).json({
        status: 400,
        message: 'No se pudo obtener la invitacion',
        error: null,
        data: null
      })
    }

    if(request.input('respuesta') === true) {
      const usT = await UserTienda.query().where('user_id', invitacion.owner_id).andWhere('is_owner', true).andWhere('tienda_id', invitacion.tienda_id).first()

      if(!usT) {
        return response.status(400).json({
          status: 400,
          message: 'No se pudo obtener la tienda',
          error: null,
          data: null
        })
      }

      if(await UserTienda.query().where('user_id', invitacion.invitado_id).andWhere('tienda_id', invitacion.tienda_id).first()) {
        return response.status(400).json({
          status: 400,
          message: 'El usuario ya esta en la tienda',
          error: null,
          data: null
        })
      }

      const userTienda = await UserTienda.create({
        user_id: invitacion.invitado_id,
        tienda_id: invitacion.tienda_id,
        is_owner: false,
      })

      invitacion.delete()

      Ws.io.emit('invitacion');
      return response.status(200).json({
        status: 200,
        message: 'Invitacion aceptada',
        error: null,
        data: userTienda
      })
    }

    if(request.input('respuesta') === false) {

      invitacion.delete()

      Ws.io.emit('invitacion');
      return response.status(200).json({
        status: 200,
        message: 'Invitacion rechazada',
        error: null,
        data: null
      })
    }


  }

  public async misInvitacionesEnviadasToken({auth, response}: HttpContextContract){
    const user = await auth.use('api').authenticate()

    const invitaciones = await Invitacione.query().where('owner_id', user.id)

    if(!invitaciones) {
      return response.status(400).json({
        status: 400,
        message: 'No se pudo obtener las invitaciones',
        error: null,
        data: null
      })
    }

    return invitaciones
  }

  public async misInvitacionesRecibidasToken({auth, response}: HttpContextContract) {

    const user = await auth.use('api').authenticate()

    const invitaciones = await Invitacione.query().where('invitado_id', user.id)

    if(!invitaciones) {
      return response.status(400).json({
        status: 400,
        message: 'No se pudo obtener las invitaciones',
        error: null,
        data: null
      })
    }

    return invitaciones
  }
}
