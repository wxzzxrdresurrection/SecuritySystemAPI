import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RolVerify {
  public async handle({auth}: HttpContextContract, next: () => Promise<void>, ...roles: string[]) {
    const user = await auth.use('api').authenticate()
    const rolesArray = roles.join(',').split(',')

    for(const role of rolesArray) {
      if(user.rol_id === Number(role)) {
        await next()
        return
      }
    }
  }
}
