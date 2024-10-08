import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { WindowApiConst } from 'shared-lib';
import { ElectronIpcService } from '../../services/electron-ipc.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
	selector: 'app-multiples',
	templateUrl: './multiples.component.html',
	styleUrls: ['./multiples.component.scss'],
})
export class MultiplesComponent implements OnInit, OnDestroy {
	// Liste des temps disponibles en minutes
	availableTimes: number[] = [1, 2, 3, 4, 5, 10, 15, 20, 30];

	selectedTime: number = 1; // Temps sélectionné en minutes
	remainingTime: number = 0; // Temps restant en secondes
	displayTime: string = '00:00'; // Temps affiché en format mm:ss
	value: number = 100; // Valeur en pourcentage
	isRunning: boolean = false; // État du compte à rebours
	intervalId: any; // ID de l'intervalle

	mode: ProgressSpinnerMode = 'determinate';

	timesTableForm = new UntypedFormGroup({
		input: new FormControl<number>(Math.round(Math.random() * 100) % 10, {
			nonNullable: true,
		}),
	});

	multiples: number[] = [];

	constructor(
		private electronIpc: ElectronIpcService,
		private translate: TranslateService
	) {}

	ngOnInit(): void {
		this.loadSavedTime();

		// Specifying what to do with received data from main process
		this.electronIpc.receive<number[]>(
			WindowApiConst.MULTIPLES_OUTPUT,
			(output: number[]) => {
				// Update current data
				this.multiples = output;
			}
		);

		// Reset multiples on form changes
		this.timesTableForm.valueChanges.subscribe(() => {
			this.multiples = [];
		});

		// Init time tables with given random value
		this.onSubmit();
	}

	// Charger la valeur depuis le localStorage
	loadSavedTime() {
		const savedTime = localStorage.getItem('selectedTime');
		if (savedTime) {
			this.selectedTime = +savedTime; // Convertir en nombre
		}
		this.remainingTime = this.selectedTime * 60;
		this.updateDisplayTime();
	}

	// Sauvegarder la valeur sélectionnée dans le localStorage
	saveSelectedTime() {
		localStorage.setItem('selectedTime', this.selectedTime.toString());
	}

	// Appelé quand l'utilisateur change le temps sélectionné
	onTimeChange() {
		this.saveSelectedTime(); // Sauvegarder la nouvelle valeur dans le localStorage
		this.resetCountdown(); // Réinitialiser le compte à rebours avec la nouvelle valeur
	}

	translateIn(lang: string): void {
		this.translate.use(lang);
	}

	onSubmit(): void {
		const input = this.timesTableForm.value.input;
		this.electronIpc.send(WindowApiConst.MULTIPLES_INPUT, input);
	}

	// Méthode pour démarrer/mettre en pause le compte à rebours
	toggleCountdown() {
		if (this.isRunning) {
			// Si le compte à rebours est en cours, on met en pause
			clearInterval(this.intervalId);
		} else {
			// Si on commence ou reprend le compte à rebours
			if (this.remainingTime === 0) {
				// Si le compte est à 0, on initialise à la valeur sélectionnée
				this.remainingTime = this.selectedTime * 60; // Convertir le temps en secondes
			}
			this.startCountdown(); // Démarrer ou reprendre le compte à rebours
		}
		this.isRunning = !this.isRunning;
	}

	// Méthode pour démarrer le compte à rebours
	startCountdown() {
		const totalTime = this.selectedTime * 60;

		this.intervalId = setInterval(() => {
			if (this.remainingTime > 0) {
				this.remainingTime--;
				this.updateDisplayTime();
				this.updateValue(totalTime);
			} else {
				// Arrêt automatique une fois le compte à rebours fini
				clearInterval(this.intervalId);
				this.isRunning = false;
			}
		}, 1000);
	}

	// Mise à jour du format mm:ss
	updateDisplayTime() {
		const minutes = Math.floor(this.remainingTime / 60);
		const seconds = this.remainingTime % 60;
		this.displayTime = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
	}

	// Mise à jour de la valeur en pourcentage
	updateValue(totalTime: number) {
		this.value = (this.remainingTime / totalTime) * 100;
	}

	// Réinitialiser le compte à rebours
	resetCountdown() {
		clearInterval(this.intervalId);
		this.remainingTime = this.selectedTime * 60; // Remettre à la valeur sélectionnée
		this.updateDisplayTime();
		this.value = 100; // Réinitialiser la progression à 100%
		this.isRunning = false;
	}

	// Ajouter des zéros pour le formatage (ex: 09:05)
	padZero(num: number): string {
		return num < 10 ? '0' + num : num.toString();
	}

	// Nettoyage lorsque le composant est détruit
	ngOnDestroy() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}
}
