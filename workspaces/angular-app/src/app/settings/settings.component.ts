import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CountdownService } from '../services/countdown.service';
import { ElectronIpcService } from '../services/electron-ipc.service';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './settings.component.html',
	styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
	availableTimes: number[] = [1, 2, 3, 4, 5, 10, 15, 20, 30];
	selectedTime: number;

	constructor(
		private countdownService: CountdownService,
		private router: Router,
		private electronIpc: ElectronIpcService
	) {
		this.selectedTime = this.countdownService.getSelectedTime(); // Charge le temps sélectionné depuis le service

		//test
		//const filePath = '/Volumes/Carlos/Streamlabs/timer.txt';
		//const time = '05:00'; // ou une autre valeur
		//const result = this.electronIpc.writeTimeToFile(filePath, time);
		//console.log(result);
	}

	onTimeChange(event: Event): void {
		const selectElement = event.target as HTMLSelectElement;
		// Extraire la valeur de l'élément de sélection
		const selectedValue = selectElement.value;
		// Convertir la valeur en nombre
		const newTime: number = Number(selectedValue);

		this.countdownService.setSelectedTime(newTime); // Met à jour le service
	}

	// Dans votre composant
	async selectFile() {
		const filePath = await this.electronIpc.openFile();
		if (filePath) {
			console.log('Fichier sélectionné :', filePath);
			this.countdownService.setFilePath(filePath); // Persistance dans CountdownService
			// Autres opérations
		}
	}

	navigateToHome() {
		this.router.navigate(['/']); // Navigue vers la page de settings
	}

	ngOnInit() {
		const savedFilePath = this.countdownService.getFilePath();
		if (savedFilePath) {
			console.log(
				'Chemin du fichier chargé depuis la persistance :',
				savedFilePath
			);
			// Utiliser le chemin du fichier pour d'autres opérations si nécessaire
		}
	}
}
