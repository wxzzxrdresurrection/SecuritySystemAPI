import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'

export default class UsersController {
  public async registro({ request, response }: HttpContextContract) {
    await request.validate({
      schema: schema.create({
        nombre: schema.string([rules.maxLength(100)]),
        ap_paterno: schema.string([rules.maxLength(60)]),
        ap_materno: schema.string([rules.maxLength(60)]),
        correo: schema.string([
          rules.email(),
          rules.maxLength(120),
          rules.unique({ table: 'users', column: 'correo' }),
        ]),
        telefono: schema.string([
          rules.minLength(10),
          rules.maxLength(10),
          rules.unique({ table: 'users', column: 'telefono' }),
        ]),
        password: schema.string([rules.minLength(8), rules.maxLength(500), rules.trim()]),
      }),
      messages: {
        required: 'El campo {{ field }} es obligatorio',
        maxLength: 'El campo {{ field }} no puede tener más de {{ options.maxLength }} caracteres',
        minLength:
          'El campo {{ field }} no puede tener menos de {{ options.minLength }} caracteres',
        correo: 'El campo {{ field }} debe ser un correo válido',
        trim: 'El campo { field } no debe contener espacios en blanco',
        string: 'El campo {{ field }} debe ser un texto',
        unique: 'El campo { field } ya está en uso',
      },
    })

    const user = await User.create({
      nombre: request.input('nombre'),
      ap_paterno: request.input('ap_paterno'),
      ap_materno: request.input('ap_materno'),
      correo: request.input('correo'),
      telefono: request.input('telefono'),
      password: await Hash.make(request.input('password')),
    })

    return response.status(201).created({
      status: 201,
      message: 'Usuario registrado correctamente',
      error: null,
      data: user,
    })
  }

  public async login({ request, response, auth }: HttpContextContract) {
    await request.validate({
      schema: schema.create({
        correo_o_telefono: schema.string([rules.maxLength(120), rules.trim()]),
        password: schema.string([rules.minLength(8), rules.maxLength(500), rules.trim()]),
      }),
      messages: {
        required: 'El campo {{ field }} es obligatorio',
        maxLength: 'El campo {{ field }} no puede tener más de {{ options.maxLength }} caracteres',
        minLength:
          'El campo {{ field }} no puede tener menos de {{ options.minLength }} caracteres',
        trim: 'El campo { field } no debe contener espacios en blanco',
      },
    })

    const user = await User.query()
      .where('correo', request.input('correo_o_telefono'))
      .orWhere('telefono', request.input('correo_o_telefono'))
      .first()

    if (!user || !(await Hash.verify(user.password, request.input('password')))) {
      return response.status(404).created({
        status: 404,
        message: 'El usuario o la contraseña no es correcta',
        error: null,
        data: null,
      })
    }

    if (user.estatus === 0) {
      return response.status(404).created({
        status: 404,
        message: 'Si deseas activar tu cuenta, contacte con un adminstrador',
        error: 'Usuario desactivado',
        data: null,
      })
    }

    const token = await auth.use('api').generate(user)

    return response.status(200).created({
      status: 200,
      message: 'Usuario logueado correctamente',
      error: null,
      data: request.all(),
      token: token,
    })
  }
}
