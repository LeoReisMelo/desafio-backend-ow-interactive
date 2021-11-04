//All dependency imports
import Route from '@ioc:Adonis/Core/Route';

//Movements routes
Route.post('/createMovement', 'MovementsController.create');
Route.post('/createCsvFile', 'MovementsController.createCsvFile');

Route.get('/listMovements', 'MovementsController.index');
Route.get('/findMovement', 'MovementsController.findMovement');

Route.delete('/deleteMovement', 'MovementsController.deleteMovement');

//Users routes
Route.post('/createUser', 'UsersController.create');
Route.post('/addBalance', 'UsersController.addBalance');
Route.post('/withdrawBalance', 'UsersController.withdrawBalance');

Route.get('/listUsers', 'UsersController.index');
Route.get('/findUser', 'UsersController.findUser');
Route.get('/sumAllMovements', 'UsersController.sumAllMovements');

Route.delete('/deleteUser', 'UsersController.deleteUser');
