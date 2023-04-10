import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Active {
  public async handle({auth, response}: HttpContextContract, next: () => Promise<void>) {
    const user = await auth.use('api').authenticate()

    if (user.estatus === '0') {
      return response.abort('El usuario no está activo', 401)
    }

    await next()
  }
}
