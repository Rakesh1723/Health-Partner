import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component'
import { FitnessComponent } from './fitness/fitness.component';
import { DietComponent } from './diet/diet.component';
import { WellnessComponent } from './wellness/wellness.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';


export const routes: Routes = [
  { path: '', component: LandingpageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: ProfileComponent},
  { path: 'fitness', component: FitnessComponent},
  { path: 'diet', component: DietComponent},
  { path: 'wellness', component: WellnessComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: '**', redirectTo: '' }
];
