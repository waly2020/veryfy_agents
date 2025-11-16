import { Routes } from '@angular/router';
import { BottomBarLayout } from './components/layouts/bottom-bar-layout/bottom-bar-layout';
import { PlainLayout } from './components/layouts/plain-layout/plain-layout';
import { Home } from './components/pages/home/home';
import { Interventions } from './components/pages/interventions/interventions';
import { Clients } from './components/pages/clients/clients';
import { ClientsCreate } from './components/pages/clients-create/clients-create';
import { Entreprises } from './components/pages/entreprises/entreprises';
import { EntreprisesCreate } from './components/pages/entreprises-create/entreprises-create';
import { Profil } from './components/pages/profil/profil';
import { Login } from './components/pages/login/login';
import { TacheDetail } from './components/pages/tache-detail/tache-detail';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: BottomBarLayout,
    canActivateChild: [authGuard],
    children: [
      { path: '', component: Home, title: 'Accueil' },
      { path: 'interventions', component: Interventions, title: 'Interventions' },
      { path: 'clients', component: Clients, title: 'Clients' },
      { path: 'entreprises', component: Entreprises, title: 'Entreprises' },
      { path: 'profil', component: Profil, title: 'Profil' },
    ],
  },
  {
    path: '',
    component: PlainLayout,
    children: [
      { path: 'auth/login', component: Login, title: 'Connexion Agent' },
      { path: 'interventions/:id', component: TacheDetail, title: 'Détail intervention', canActivate: [authGuard] },
      { path: 'clients/create', component: ClientsCreate, title: 'Créer un client', canActivate: [authGuard] },
      { path: 'entreprises/create', component: EntreprisesCreate, title: 'Créer une entreprise', canActivate: [authGuard] },
    ],
  },
  { path: '**', redirectTo: '' },
];
