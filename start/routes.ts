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

Route.group(() => {
  Route.get('/tiendas', 'TiendasController.allTiendas')
  Route.post('/tienda', 'TiendasController.createTienda')
  Route.get('/tienda/:id', 'TiendasController.getTienda')
  Route.put('/tiendas/:id', 'TiendasController.updateTienda')
  Route.delete('/tiendas/:id', 'TiendasController.deleteTienda')
})

Route.group(() => {
  Route.get('/user/:id', 'UsersController.getUser')
  Route.get('/users', 'UsersController.allUsers')
  Route.get('/users/mod', 'UsersController.getMods')
  Route.get('/users/normal', 'UsersController.getNormalUsers')
  Route.get('/users/info', 'UsersController.getMyInfo').middleware('auth')
})
