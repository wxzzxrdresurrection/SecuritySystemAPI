import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Peticione from 'App/Models/Peticione'
import { schema } from '@ioc:Adonis/Core/Validator'
import { DateTime } from 'luxon'
import User from 'App/Models/User'

export default class PeticionesController {
  public async createPeticion({request, response} : HttpContextContract){
    await request.validate({
      schema: schema.create({
        user_id : schema.number(),
      }),
      messages:{
        'user_id.required': 'El id del usuario es requerido',
        number: 'El campo {{ field }} debe ser un numero',
      }
    })

    const peticion = await Peticione.create({
      user_id: request.input('user_id'),
      mensaje: request.input('mensaje'),
      fecha : DateTime.now().toFormat('yyyy-MM-dd'),
    })

    if(!peticion){
      return response.status(400).json({
        status: 400,
        message: 'Error al crear la peticion',
        error: null,
        data: null,
      })
    }

    return response.status(201).json({
      status: 201,
      message: 'Peticion creada correctamente',
      error: null,
      data: peticion,
    })
  }

  public async getPeticiones({response} : HttpContextContract){
    const peticiones = await (await Peticione.all()).reverse().filter(peticion => peticion.estado === null);


    if(!peticiones){
      return response.status(400).json({
        status: 400,
        message: 'Error al obtener las peticiones',
        error: null,
        data: null,
      })
    }

    return peticiones
  }

  public async statusPeticion({request, params, response} : HttpContextContract){
    const peticion = await Peticione.find(params.id)

    await request.validate({
      schema: schema.create({
        estado : schema.boolean(),
      })
    })

    if(!peticion){
      return response.status(400).json({
        status: 400,
        message: 'Error al obtener la peticion',
        error: null,
        data: null,
      })
    }

    peticion.estado = request.input('estado')

    if(await peticion.save()){
      if (peticion.estado == true)
      {
        const user = await User.find(peticion.user_id)

        if(!user){
          return response.status(400).json({
            status: 400,
            message: 'Error al obtener el usuario',
            error: null,
            data: null,
          })
        }

        const updatedUser = await user.merge({
          estatus: 3
        }).save()

        if(!updatedUser){
          return response.status(400).json({
            status: 400,
            message: 'Error al actualizar el usuario',
            error: null,
            data: null,
          })
        }
      }

      return response.status(200).json({
        status: 200,
        message: 'Peticion actualizada correctamente',
        error: null,
        data: peticion,
      })
    }
  }
}
