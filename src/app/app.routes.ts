import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        title: 'LOVI - Home page' 
    },
    {
        path: 'login',
        component: Login,
        title: 'LOVI - Log in' 
    },
    {
        path: 'register',
        component: Register,
        title: 'LOVI - Register' 
    },
    { 
        path: '**',
        redirectTo: '',
        //canActivate: [authGuard]
    }
     
];
