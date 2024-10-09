import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CountdownService } from '../services/countdown.service';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './settings.component.html',
	styleUrl: './settings.component.scss',
})
export class SettingsComponent {
	availableTimes: number[] = [1, 2, 3, 4, 5, 10, 15, 20, 30];
	selectedTime: number;

	constructor(
		private countdownService: CountdownService,
		private router: Router
	) {
		this.selectedTime = this.countdownService.getSelectedTime(); // Charge le temps sélectionné depuis le service
	}

	onTimeChange(event: Event): void {
		const selectElement = event.target as HTMLSelectElement;
		// Extraire la valeur de l'élément de sélection
		const selectedValue = selectElement.value;
		// Convertir la valeur en nombre
		const newTime: number = Number(selectedValue);

		this.countdownService.setSelectedTime(newTime); // Met à jour le service
	}

	navigateToHome() {
		this.router.navigate(['/']); // Navigue vers la page de settings
	}
}
