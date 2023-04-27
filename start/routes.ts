/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})
Route.post('/registro/info', 'UsersController.registrarInfoPersonal')
Route.post('/registro/user', 'UsersController.registro')
Route.post('/login', 'UsersController.login')
Route.get('/logout', 'UsersController.logout').middleware('auth')
Route.get('/preguntas', 'UsersController.getPreguntas')
Route.post('/verify/access', 'UsersController.verifyAvailableEmailAndPhone')
Route.post('/send/email', 'UsersController.recuperacionCorreo')
Route.put('/receive/code/:id', 'UsersController.verifyCode').as('codigo')
Route.post('/send/sms', 'UsersController.recuperacionTelefono')
Route.get('/send/sms/verify/:id', 'UsersController.sendSMS').as('sendSMS')


Route.group(() => {
  Route.get('/tiendas', 'TiendasController.allTiendas')
  Route.post('/tienda', 'TiendasController.createTienda')
  Route.get('/tienda/:id', 'TiendasController.getTienda').where('id', '[0-9]+')
  Route.put('/tiendas/:id', 'TiendasController.updateTienda').where('id', '[0-9]+')
  Route.delete('/tiendas/:id', 'TiendasController.deleteTienda').where('id', '[0-9]+')

  Route.post('/tienda/invite', 'TiendaUsersController.insertUser')

  Route.get('/tiendas/invitados/:id', 'TiendaUsersController.getInvitaciones').where('id', '[0-9]+')
  Route.get('/tiendas/invitados/owners', 'TiendaUsersController.getOwners')
  Route.post('/tiendas/invitado', 'TiendaUsersController.addInvitado')
  Route.put('/tiendas/invitados/:id', 'TiendaUsersController.deleteInvitados').where('id', '[0-9]+')
  Route.get('/tiendas/invitados/guests/:id', 'TiendaUsersController.getGuests').where('id', '[0-9]+')
  Route.get('/tiendas/propias', 'TiendaUsersController.misTiendasToken')
  Route.get('/tienda/invitar', 'TiendaUsersController.invitarAMisTiendas')
  Route.post('/tienda/verify/owner','TiendaUsersController.verifyOwner')
})

Route.group(() => {
  Route.get('/user/:id', 'UsersController.getUser').where('id', '[0-9]+')
  Route.get('/users', 'UsersController.allUsers')
  Route.get('/users/mod', 'UsersController.getMods')
  Route.get('/users/normal', 'UsersController.getNormalUsers')
  Route.get('/users/access', 'UsersController.getUserAccess')
  Route.get('/users/info', 'UsersController.getMyInfo').middleware('auth')
  Route.get('/users/info/:id', 'UsersController.getInfoUser').where('id', '[0-9]+')
  Route.post('/registro/complete', 'UsersController.registroCompleto')
  Route.get('/verify/token', 'UsersController.verifyToken')
  Route.delete('/users/:id', 'UsersController.deleteUser').where('id', '[0-9]+')
  Route.put('/users/:id', 'UsersController.updateUser').where('id', '[0-9]+')
  Route.put('/users/password/:id', 'UsersController.updateUserPassword').where('id', '[0-9]+')
  Route.put('/users/info/:id', 'UsersController.updateInfoUser').where('id', '[0-9]+')
  Route.post('/users/mod', 'UsersController.addUserModerador')
  Route.delete('/users/mod/:id', 'UsersController.deleteMod').where('id', '[0-9]+')
  Route.get('/user/pregunta/:id', 'UsersController.getMyPregunta').where('id', '[0-9]+')
  Route.post('/user/pregunta/answer' , 'UsersController.recuperacionPregunta')
  Route.put('/user/update/password', 'UsersController.updatePassword')
  Route.post('/user/email/phone', 'UsersController.getUserByEmailOrPhone')

  Route.put('/user/update/access', 'UsersController.updateUserToken')
  Route.put('/user/update/info', 'UsersController.updateInfoUserToken')
  Route.put('/user/update/password/auth', 'UsersController.updatePasswordToken')
  Route.get('/users/info/all', 'UsersController.allInfoUsers')

})


Route.group(() => {
  Route.get('/activada', 'UsersController.cuentaActivada')
  Route.get('/desactivada', 'UsersController.cuentaDesactivada')
  Route.get('/creada', 'UsersController.cuentaCreada')
  Route.get('/exitosa', 'UsersController.cuentaExitosa')

}).prefix('/correo/cuenta')


Route.group(() => {

  Route.group(() => {
    Route.get('/sensores', 'SensorsController.allSensores')
    Route.get('/tienda/sensores/:id', 'SensorsController.getTiendaSensores')
    Route.post('/show/sensores', 'SensorsController.showSensores')
    Route.get('/sensor/valores', 'SensorsController.getValues')
    Route.get('/sensores/tienda/:id', 'SensorsController.getSensoresByTienda')
    Route.post('/sensor/temperatura/value', 'SensorsController.getSensorTempValue')
    Route.post('/sensor/agua/value', 'SensorsController.getSensorAguaValue')
    Route.post('/sensor/luz/value', 'SensorsController.getSensorLuzValue')
    Route.post('/sensor/humo/value', 'SensorsController.getSensorHumoValue')
    Route.post('/sensor/movimiento/value', 'SensorsController.getSensorMovimientoValue')
    Route.post('/sensor/infrarrojo/value', 'SensorsController.getSensorInfraValue')
    Route.post('/sensor/distancia/value', 'SensorsController.getSensorDistanciaValue')
    Route.post('/peticion', 'PeticionesController.createPeticion')
  }).middleware(['role:1'])

  Route.group(() => {
    Route.post('/invitacion', 'InvitacionesController.sendInvitacion')
    Route.get('/invitaciones/:id', 'InvitacionesController.misInvitaciones').where('id', '[0-9]+')
    Route.post('/invitacion/process', 'InvitacionesController.procesarInvitacion')
    Route.get('/invitaciones/recibidas', 'InvitacionesController.misInvitacionesRecibidasToken')
    Route.get('/invitaciones/enviadas', 'InvitacionesController.misInvitacionesEnviadasToken')
  }).middleware(['role:2,1'])
  Route.group(() => {

    Route.get('/peticiones', 'PeticionesController.getPeticiones')
    Route.put('/peticion/status/:id', 'PeticionesController.statusPeticion').where('id', '[0-9]+')
  }).middleware(['role:3'])

}).middleware(['active'])

