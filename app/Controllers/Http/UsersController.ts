import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'
import InfoUser from 'App/Models/InfoUser'
import Pregunta from 'App/Models/Pregunta'

export default class UsersController {
  //CALADO
  public async registrarInfoPersonal({request, response}:HttpContextContract){
    await request.validate({
      schema: schema.create({
        nombre: schema.string([rules.maxLength(100)]),
        ap_paterno: schema.string([rules.maxLength(60)]),
        ap_materno: schema.string([rules.maxLength(60)]),
        sexo: schema.enum(['Masculino','Femenino']),
        fecha_nacimiento: schema.date({format: 'yyyy-mm-dd'}),
      }),
      messages: {
        required: 'El campo {{ field }} es obligatorio',
        maxLength: 'El campo {{ field }} no puede tener más de {{ options.maxLength }} caracteres',
        enum: 'El campo {{ field }} solo permite estas opciones: {{ options.choices }}',
        'date.format': 'El campo {{ field }} debe ser un formato {{ options.format }}',
      }
    })

    const infoUser = await InfoUser.create({
      nombre: request.input('nombre'),
      ap_paterno: request.input('ap_paterno'),
      ap_materno: request.input('ap_materno'),
      sexo: request.input('sexo'),
      fecha_nacimiento: request.input('fecha_nacimiento'),
      pregunta_id : request.input('pregunta_id'),
      respuesta: request.input('respuesta'),
    })

    if(!infoUser){
      return response.status(400).json({
        status: 400,
        message: 'No se pudo registrar la información personal',
        error: null,
        data: null,
      })
    }

    return response.status(201).json({
      status: 201,
      message: 'Información personal registrada correctamente',
      error: null,
      data: infoUser,
    })

  }
  //CALADO
  public async registro({ request, response }: HttpContextContract) {
    await request.validate({
      schema: schema.create({
        username: schema.string([
          rules.minLength(5),
          rules.maxLength(50),
        ]),
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
        info_user_id: schema.number([rules.exists({ table: 'info_users', column: 'id' })]),
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
        exists: 'El campo { field } no existe',
      },
    })

    const user = await User.create({
      username: request.input('username'),
      correo: request.input('correo'),
      telefono: request.input('telefono'),
      password: await Hash.make(request.input('password')),
      info_user_id : request.input('info_user_id'),
    })

    return response.status(201).json({
      status: 201,
      message: 'Usuario registrado correctamente',
      error: null,
      data: user,
    })
  }
  //CALADO
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
      return response.status(404).json({
        status: 404,
        message: 'El usuario o la contraseña no es correcta',
        error: null,
        data: null,
      })
    }

    if (user.estatus === 0) {
      return response.status(404).json({
        status: 404,
        message: 'Si deseas activar tu cuenta, contacte con un adminstrador',
        error: 'Usuario desactivado',
        data: null,
      })
    }

    const token = await auth.use('api').generate(user)

    return response.status(200).json({
      status: 200,
      message: 'Usuario logueado correctamente',
      error: null,
      data: request.all(),
      id: user.id,
      username: user.username,
      role: user.rol_id,
      token: token,
    })
  }
  //CALADO
  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()

    return response.status(200).json({
      status: 200,
      message: 'Sesión cerrada correctamente',
      error: null,
      data: null,
    })
  }
  //CALADO
  public async allUsers({response}: HttpContextContract){
    const users = (await User.all()).reverse()

    return response.status(200).json({
      status: 200,
      message: 'Usuarios obtenidos correctamente',
      error: null,
      data: users,
    })
  }
  //CALADO
  public async getUser({params, response}: HttpContextContract){
    const user = await User.find(params.id)

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    return response.status(200).json({
      status: 200,
      message: 'Usuario obtenido correctamente',
      error: null,
      data: user,
    })
  }
  //CALADO
  public async getPreguntas({response}){
    const preguntas = (await Pregunta.all()).reverse()

    return response.status(200).json({
      status: 200,
      message: 'Preguntas obtenidas correctamente',
      error: null,
      data: preguntas,
    })

  }
  //CALADO
  public async getMods({response}){
    const users = await User.query().where('rol_id', 2)

    return response.status(200).json({
      status: 200,
      message: 'Datos obtenidos correctamente',
      error: null,
      data: users
    })

  }
  //CALADO
  public async getNormalUsers({response}){
    const users = await User.query().where('rol_id', 3)

    return response.status(200).json({
      status: 200,
      message: 'Usuarios obtenidos correctamente',
      error: null,
      data: users
    })

  }

  public async verifyAvailableEmailAndPhone({request, response}: HttpContextContract){
    schema.create({
      correo: schema.string([
        rules.email(),
        rules.maxLength(120),
      ]),
      telefono: schema.string([
        rules.maxLength(10),
        rules.minLength(10),
      ])
    })

      const user = await User.query()
        .where('correo', request.input('correo'))
        .orWhere('telefono', request.input('telefono'))
        .first()

      if(user){
        return response.status(404).json({
          status: 404,
          message: 'El correo o el telefono ya están en uso',
          error: null,
          data: null,
        })
      }

      return response.status(200).json({
        status: 200,
        message: 'El correo y el telefono están disponibles',
        error: null,
        data: null,
      })

  }

  //CALADO
  public async getMyInfo({auth, response}: HttpContextContract){

    const user = await auth.use('api').authenticate()
    const infoUser = await InfoUser.find(user.info_user_id)


    if(!infoUser){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    return response.status(200).json({
      status: 200,
      message: 'Usuario obtenido correctamente',
      error: null,
      data: infoUser,
    })
  }



}
