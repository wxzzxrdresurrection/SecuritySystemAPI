import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'
import InfoUser from 'App/Models/InfoUser'
import Pregunta from 'App/Models/Pregunta'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'
import Ws from 'App/Services/Ws'
const { Vonage } = require('@vonage/server-sdk')

export default class UsersController {

  //Login y Registro
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
        enum: 'El campo {{ field }} solo p  ermite estas opciones: {{ options.choices }}',
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
      respuesta: request.input('respuesta').toLowerCase(),
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

  public async sendSMS({request, params, response}: HttpContextContract){

    if(!request.hasValidSignature){
      return response.status(401).json({
        status: 401,
        message: 'No se pudo verificar la firma',
        error: null,
        data: null,
      })
    }

    const user = await User.find(params.id)

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'El usuario no existe',
        error: null,
        data: null,
      })
    }
    const codigo = Math.floor(Math.random() * 9000 + 1000).toString()

    await user.merge({
      codigo_verificacion: codigo,
      estatus : 1
    }).save()

    const ruta = Route.makeSignedUrl('codigo',{id: user.id}, {expiresIn: '1h', prefixUrl: Env.get('APP_URL')})

    const vonage = new Vonage({
      apiKey: Env.get('VONAGE_API_KEY'),
      apiSecret: Env.get('VONAGE_API_SECRET'),
    })

    const from = "Shop Shield"
    const to =  "52" + user.telefono
    const text = 'Su codigo de activacion es: ' + codigo

    await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'), console.log(resp)})
        .catch(err => { console.log('There was an error sending the messages.'), console.error(err) })

    return response.status(200).json({
      status: 200,
      message: 'Codigo enviado correctamente',
      error: null,
      data: null,
      ruta: ruta,
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
      return response.status(404).json({
        status: 404,
        message: 'El usuario o la contraseña no es correcta',
        error: null,
        data: null,
      })
    }

    if (user.estatus === 0) {

      const ruta = Route.makeSignedUrl('sendSMS', {params: {id: user.id}})

      try{
        await Mail.send((message) => {
          message
            .from('')
            .to(request.input('correo'))
            .subject('Activacion de cuenta')
            .htmlView('emails/activacion', {user : user, ruta: ruta})
        })
      }
      catch(error){
        console.log(error)
      }

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
      email: user.correo,
      role: user.rol_id,
      token: token,
    })
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()

    return response.status(200).json({
      status: 200,
      message: 'Sesión cerrada correctamente',
      error: null,
      data: null,
    })
  }

  //Usuarios
  //CALADO
  public async allUsers(){
    const users = (await User.all()).reverse()

    /*return response.status(200).json({
      status: 200,
      message: 'Usuarios obtenidos correctamente',
      error: null,
      data: users,
    })*/

    return users;
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

    /*return response.status(200).json({
      status: 200,
      message: 'Usuario obtenido correctamente',
      error: null,
      data: user,
    })*/

    return user;
  }

  //CALADO
  public async getPreguntas(){
    const preguntas = (await Pregunta.all()).reverse()

    /*return response.status(200).json({
      status: 200,
      message: 'Preguntas obtenidas correctamente',
      error: null,
      data: preguntas,
    })*/

    return preguntas;

  }

  //CALADO
  public async getMods(){
    const users = await User.query().where('rol_id', 2)

    /*return response.status(200).json({
      status: 200,
      message: 'Datos obtenidos correctamente',
      error: null,
      data: users
    })*/

    return users;
  }

  //CALADO
  public async getNormalUsers(){
    const users = await User.query().where('rol_id', 3)

    /*return response.status(200).json({
      status: 200,
      message: 'Usuarios obtenidos correctamente',
      error: null,
      data: users
    })*/

    return users;
  }

  //CALADO
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

    /*return response.status(200).json({
      status: 200,
      message: 'Usuario obtenido correctamente',
      error: null,
      data: infoUser,
    })*/

    return infoUser;
  }

  //CALADO
  public async registroCompleto({request, response}:HttpContextContract){

    await request.validate({
    schema: schema.create({
      nombre: schema.string([
        rules.maxLength(100)
      ]),
      ap_paterno: schema.string([
        rules.maxLength(60)
      ]),
      ap_materno: schema.string([
        rules.maxLength(60)
      ]),
      sexo: schema.string(),
      fecha_nacimiento: schema.string(),
      pregunta_id : schema.number(),
      respuesta: schema.string([]),
      username: schema.string([
        rules.maxLength(50)
      ]),
      correo: schema.string([
        rules.email(),
        rules.maxLength(120),
      ]),
      password: schema.string([
        rules.minLength(8),
        rules.trim()
      ]),
      telefono: schema.string([
        rules.maxLength(10),
        rules.minLength(10),
      ]),
    }),
    messages:{
      required: 'El campo {{ field }} es requerido',
      'correo.email': 'El correo no es válido',
      maxLength: 'El campo {{ field }} no puede tener más de {{ options.length }} caracteres',
      minLength: 'El campo {{ field }} no puede tener menos de {{ options.length }} caracteres',
      number: 'El campo {{ field }} debe ser un número',
      string: 'El campo {{ field }} debe ser una cadena de texto',
      trim: 'El campo {{ field }} no puede tener espacios al inicio o al final',
    }
    })

    const infoUser = InfoUser.create({
      nombre: request.input('nombre'),
      ap_paterno: request.input('ap_paterno'),
      ap_materno: request.input('ap_materno'),
      sexo: request.input('sexo'),
      fecha_nacimiento: request.input('fecha_nacimiento'),
      pregunta_id: request.input('pregunta_id'),
      respuesta: request.input('respuesta'),
    })

    if(!infoUser){
      return response.status(404).json({
        status: 404,
        message: 'Error al crear la informacion de usuario',
        error: null,
        data: null,
      })
    }

    const user = await User.create({
      username: request.input('username'),
      correo: request.input('correo'),
      password: await Hash.make(request.input('password')),
      telefono: request.input('telefono'),
      info_user_id: (await infoUser).id,
    })

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Error al crear el usuario',
        error: null,
        data: null,
      })
    }

    Ws.io.emit('usuario', user);
    return response.status(201).json({
      status: 201,
      message: 'Usuario creado correctamente',
      error: null,
      user: user,
      info: infoUser
    })



  }

  //CALADO
  public async getInfoUser({params, response}: HttpContextContract){

    const user = await User.find(params.id)

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    const infoUser = await InfoUser.find(user.info_user_id)

    if(!infoUser){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    return infoUser

  }

  //CALADO
  public async verifyToken({auth, response}: HttpContextContract){
    const user = await auth.use('api').authenticate()

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
      message: 'Token válido',
      error: null,
      user_estatus: user.estatus,
      user_rol: user.rol_id
    })

  }

  //CALADO
  public async deleteUser({params, response}: HttpContextContract){
    const user = await User.find(params.id)

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    const infoUser = await InfoUser.find(user.info_user_id)

    if(!infoUser){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    await user.delete()
    await infoUser.delete()

    Ws.io.emit('usuario', user);
    return response.status(200).json({
      status: 200,
      message: 'Usuario eliminado correctamente',
      error: null,
      data: null,
    })

  }

  public async deleteMod({params, response}: HttpContextContract){
    const user = await User.find(params.id)

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    await user.delete()

    Ws.io.emit('moderador', user);
    return response.status(200).json({
      status: 200,
      message: 'Usuario eliminado correctamente',
      error: null,
      data: null,
    })

  }

  //CALADO
  public async updateUser({params ,request, response}: HttpContextContract){

    const user = await User.find(params.id)

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    const updatedUser = await user.merge({
      username: request.input('username'),
      estatus: request.input('estatus'),
      //password: await Hash.make(request.input('password')),
    }).save()

    if(!updatedUser){
      return response.status(404).json({
        status: 404,
        message: 'Error al actualizar el usuario',
        error: null,
        data: null,
      })
    }

    Ws.io.emit('usuario', updatedUser);
    Ws.io.emit('moderador', updatedUser);
    return response.status(200).json({
      status: 200,
      message: 'Usuario actualizado correctamente',
      error: null,
      data: null,
    })
  }

  //CALADO
  public async updateUserPassword({params ,request, response}: HttpContextContract){

    const user = await User.find(params.id)

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    const updatedUser = await user.merge({
      password: await Hash.make(request.input('password')),
    }).save()

    if(!updatedUser){
      return response.status(404).json({
        status: 404,
        message: 'Error al actualizar el usuario',
        error: null,
        data: null,
      })
    }

    Ws.io.emit('usuario', updatedUser);
    Ws.io.emit('moderador', updatedUser);
    return response.status(200).json({
      status: 200,
      message: 'Usuario actualizado correctamente',
      error: null,
      data: null,
    })
  }

  //CALADO
  public async updateInfoUser({params ,request, response}: HttpContextContract){

    const infoUser = await InfoUser.find(params.id)

    if(!infoUser){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    const updatedInfoUser = await infoUser.merge({
      nombre: request.input('nombre'),
      ap_paterno: request.input('ap_paterno'),
      ap_materno: request.input('ap_materno'),
      sexo: request.input('sexo'),
      fecha_nacimiento: request.input('fecha_nacimiento'),
    }).save()

    if(!updatedInfoUser){
      return response.status(404).json({
        status: 404,
        message: 'Error al actualizar la información del usuario',
        error: null,
        data: null,
      })
    }

    Ws.io.emit('usuario', updatedInfoUser);
    return response.status(200).json({
      status: 200,
      message: 'Informacion de Usuario actualizada correctamente',
      error: null,
      data: null,
    })
  }

  public async addUserModerador({request, response}: HttpContextContract){

      const user = await User.create({
        username: request.input('username'),
        correo: request.input('correo'),
        password: await Hash.make(request.input('password')),
        telefono: request.input('telefono'),
        rol_id: 2,
        estatus: 2,
      })

      if(!user){
        return response.status(404).json({
          status: 404,
          message: 'Error al crear el usuario',
          error: null,
          data: null,
        })
      }

      Ws.io.emit('moderador', user);
      return response.status(201).json({
        status: 201,
        message: 'Usuario creado correctamente',
        error: null,
        user: user,
      })
  }
  //CALADO
  public async recuperacionCorreo({request, response}:HttpContextContract){

    const user = await User.findBy('correo', request.input('correo'))

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    const codigo = Math.floor(Math.random() * 9000 + 1000).toString()

    await user.merge({
      codigo_verificacion: codigo,
    }).save()


    const ruta = Route.makeSignedUrl('codigo',{id: user.id}, {expiresIn: '1h', prefixUrl: Env.get('APP_URL')})

    try{
      await Mail.send((message) => {
        message
          .from('magicwizz12@gmail.com')
          .to(user.correo)
          .subject('RECUPERACION DE CONTRASEÑA')
          .htmlView('emails/recuperacion', {codigo: codigo})
      })
    }
    catch(e){
      console.log(e)
    }

    return response.status(200).json({
      status: 200,
      message: 'Correo enviado correctamente',
      error: null,
      data: null,
      ruta: ruta,
    })


  }
  //CALADO
  public async verifyCode({request ,params, response}: HttpContextContract){

    /*if(!request.hasValidSignature()){
      return response.status(404).json({
        status: 404,
        message: 'Ruta no valida',
        error: null,
        data: null,
      })
    }*/

    await request.validate({
      schema: schema.create({
        codigo_verificacion: schema.string({trim: true}),
      }),
      messages: {
        'codigo_verificacion.required': 'El codigo es requerido',
        'codigo_verificacion.string': 'El codigo debe ser un string',
      }
    })

    const user = await User.find(params.id)

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    if(user.codigo_verificacion !== request.input('codigo_verificacion')){
      return response.status(404).json({
        status: 404,
        message: 'Codigo incorrecto',
        error: null,
        data: null,
      })
    }

    if(user.estatus !== 2){
      await user.merge({
        estatus: 3
    }).save()
    }

    return response.status(200).json({
      status: 200,
      message: 'Codigo correcto',
      error: null,
      data: null,
    })

  }

  //CALADO
  public async recuperacionTelefono({request, response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        telefono: schema.string({trim: true}),

      })
    })

    const user = await User.findBy('telefono', request.input('telefono'))

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    const codigo = Math.floor(Math.random() * 9000 + 1000).toString()

    await user.merge({
      codigo_verificacion: codigo,
    }).save()

    const ruta = Route.makeSignedUrl('codigo',{id: user.id}, {expiresIn: '1h', prefixUrl: Env.get('APP_URL')})

    const vonage = new Vonage({
      apiKey: Env.get('VONAGE_API_KEY'),
      apiSecret: Env.get('VONAGE_API_SECRET'),
    })

    const from = "Shop Shield"
    const to =  "52" + user.telefono
    const text = 'Codigo de recuperación: ' + codigo

    await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'), console.log(resp)})
        .catch(err => { console.log('There was an error sending the messages.'), console.error(err) })

    return response.status(200).json({
      status: 200,
      message: 'Codigo enviado correctamente',
      error: null,
      data: null,
      ruta: ruta,
    })

  }

  public async recuperacionPregunta({request, response}: HttpContextContract){

      await request.validate({
        schema: schema.create({
          user_id: schema.number(),
          respuesta: schema.string({trim: true}),
        })
      })

      const user = await User.find(request.input('user_id'))

      if(!user){
        return response.status(404).json({
          status: 404,
          message: 'Usuario no encontrado',
          error: null,
          data: null,
        })
      }

      const infoUser = await InfoUser.find(user.info_user_id)

      if(!infoUser){
        return response.status(404).json({
          status: 404,
          message: 'Información de usuario no encontrada',
          error: null,
          data: null,
        })
      }


      if(infoUser.respuesta !== request.input('respuesta')){
        return response.status(404).json({
          status: 404,
          message: 'Pregunta incorrecta',
          error: null,
          data: null,
        })
      }

      return response.status(200).json({
        status: 200,
        message: 'Respuesta correcta',
        error: null,
        data: null,
      })

  }

  public async getMyPregunta({params, response}: HttpContextContract){

    const user = await User.find(params.id)

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    const infoUser = await InfoUser.find(user.info_user_id)

    if(!infoUser){
      return response.status(404).json({
        status: 404,
        message: 'Información de usuario no encontrada',
        error: null,
        data: null,
      })
    }

    const pregunta = await Pregunta.find(infoUser.pregunta_id)

    if(!pregunta){
      return response.status(404).json({
        status: 404,
        message: 'Pregunta no encontrada',
        error: null,
        data: null,
      })
    }

    return response.status(200).json({
      status: 200,
      message: 'Pregunta encontrada',
      error: null,
      data: pregunta.pregunta,
    })


  }

  public async getUserAccess({auth}: HttpContextContract){
    const user = await auth.use('api').authenticate()

    return user
  }

  public async updatePassword({request, response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        user_id: schema.number(),
        password: schema.string({trim: true}),
      })
    })

    const user = await User.find(request.input('user_id'))

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    await user.merge({
      password: await Hash.make(request.input('password')),
    }).save()

    return response.status(200).json({
      status: 200,
      message: 'Contraseña actualizada correctamente',
      error: null,
      data: null,
    })
  }

  public async updatePasswordToken({request, auth, response} :HttpContextContract){
    const user = await auth.use('api').authenticate()

    await request.validate({
      schema: schema.create({
        password: schema.string([rules.trim(), rules.minLength(8)]),
        new_password: schema.string([rules.trim(), rules.minLength(8)]),
      }),
      messages: {
        required : 'El campo {{ field }} es requerido',
        minLength: 'El campo {{ field }} debe tener al menos {{ options.minLength }} caracteres',
        trim: 'El campo {{ field }} no debe contener espacios en blanco',
      }
    })

    if(!await Hash.verify(user.password, request.input('password'))){
      return response.status(404).json({
        status: 404,
        message: 'Contraseña incorrecta',
        error: null,
        data: null,
      })
    }

    await user.merge({
      password: await Hash.make(request.input('new_password')),
    }).save()

    return response.status(200).json({
      status: 200,
      message: 'Contraseña actualizada correctamente',
      error: null,
      data: user,
    })

  }

  public async getUserByEmailOrPhone({request, response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        correo_o_telefono: schema.string({trim: true}),
      })
    })

    const user = await User.query().where('correo', request.input('correo_o_telefono'))
                       .orWhere('telefono', request.input('correo_o_telefono')).first()

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    return user
  }

  public async updateUserToken({auth, request, response}: HttpContextContract){

    await request.validate({
      schema: schema.create({
        username: schema.string({trim: true}),
      })
    })

    const user = await auth.use('api').authenticate()

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    user.merge({
      username: request.input('username'),
    }).save()

    return response.status(200).json({
      status: 200,
      message: 'Usuario actualizado correctamente',
      error: null,
      data: user,
    })

  }

  public async updateInfoUserToken({ auth, request, response}: HttpContextContract){

    const user = await auth.use('api').authenticate()

    if(!user){
      return response.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
        error: null,
        data: null,
      })
    }

    const infoUser = await InfoUser.find(user.info_user_id)

    if(!infoUser){
      return response.status(404).json({
        status: 404,
        message: 'Información de usuario no encontrada',
        error: null,
        data: null,
      })
    }

    const updatedInfo = await infoUser.merge({
      nombre: request.input('nombre'),
      ap_materno: request.input('ap_materno'),
      ap_paterno: request.input('ap_paterno'),
      sexo: request.input('sexo'),
      fecha_nacimiento: request.input('fecha_nacimiento'),
    }).save()

    return response.status(200).json({
      status: 200,
      message: 'Información de usuario actualizada correctamente',
      error: null,
      data: updatedInfo,
    })

  }

  public async  allInfoUsers({response}: HttpContextContract){

    const infoUsers = await InfoUser.all()

    if(!infoUsers){
      return response.status(404).json({
        status: 404,
        message: 'Información de usuarios no encontrada',
        error: null,
        data: null,
      })
    }

    return infoUsers

  }

  public async cuentaActivada({response}: HttpContextContract){

    try {

      await Mail.send((message) => {
        message
        .from('magicwizz12@gmail.com')
        .to('luiszapata0815@gmail.com')
        .subject('Cuenta activada')
        .htmlView('emails/cuenta_activada')
      })

    } catch (error) {

      return response.status(500).json({
        status: 500,
        message: 'Error al enviar correo',
        error: error,
        data: null,
      })

    }

  }

  public async cuentaDesactivada({response}: HttpContextContract){

    try {

      await Mail.send((message) => {
        message
        .from('magicwizz12@gmail.com')
        .to('luiszapata0815@gmail.com')
        .subject('Cuenta Desactivada')
        .htmlView('emails/cuenta_desactivada')
      })

    } catch (error) {

      return response.status(500).json({
        status: 500,
        message: 'Error al enviar correo',
        error: error,
        data: null,
      })

    }

  }

  public async cuentaCreada({response}: HttpContextContract){

    try {

      await Mail.send((message) => {
        message
        .from('magicwizz12@gmail.com')
        .to('luiszapata0815@gmail.com')
        .subject('Cuenta Creada')
        .htmlView('emails/cuenta_creada')
      })

    } catch (error) {

      return response.status(500).json({
        status: 500,
        message: 'Error al enviar correo',
        error: error,
        data: null,
      })

    }

  }

  public async cuentaExitosa({response}: HttpContextContract){

    try {

      await Mail.send((message) => {
        message
        .from('magicwizz12@gmail.com')
        .to('luiszapata0815@gmail.com')
        .subject('Cuenta activada')
        .htmlView('emails/cuenta_exitosa')
      })

    } catch (error) {

      return response.status(500).json({
        status: 500,
        message: 'Error al enviar correo',
        error: error,
        data: null,
      })

    }

  }
}
