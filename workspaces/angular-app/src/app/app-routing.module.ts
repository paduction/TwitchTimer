import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MultiplesComponent } from './components/multiples/multiples.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
	{ path: 'settings', component: SettingsComponent }, // Ajoute la route pour les settings
	{
		path: '',
		component: MultiplesComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
