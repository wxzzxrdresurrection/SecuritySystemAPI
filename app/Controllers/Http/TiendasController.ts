import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Tienda from 'App/Models/Tienda'

export default class TiendasController {
  public async createTienda({ request, response }: HttpContextContract) {
    await request.validate({
      schema: schema.create({
        nombre: schema.string([rules.maxLength(100)]),
        descripcion: schema.string([rules.maxLength(255)]),
      }),
      messages: {
        required: 'El campo {{ field }} es obligatorio',
        maxLength: 'El campo {{ field }} no puede tener más de {{ options.maxLength }} caracteres',
      },
    })

    const tienda = await Tienda.create({
      nombre: request.input('nombre'),
      descripcion: request.input('descripcion'),
    })

    return response.status(201).created({
      status: 201,
      message: 'Tienda creada correctamente',
      error: null,
      data: tienda,
    })
  }
}
