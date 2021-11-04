//All dependency imports
import Server from '@ioc:Adonis/Core/Server';
import { UserFactory, MovementsFactory } from 'Database/factories';

//Seeders
UserFactory.create();
MovementsFactory.create();

Server.middleware.register([() => import('@ioc:Adonis/Core/BodyParser')]);

Server.middleware.registerNamed({});
