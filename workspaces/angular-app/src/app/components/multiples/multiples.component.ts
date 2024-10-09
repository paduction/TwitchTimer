import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { WindowApiConst } from 'shared-lib';
import { ElectronIpcService } from '../../services/electron-ipc.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { CountdownService } from '../../services/countdown.service'; // Importe le service

@Component({
	selector: 'app-multiples',
	templateUrl: './multiples.component.html',
	styleUrls: ['./multiples.component.scss'],
})
export class MultiplesComponent implements OnInit, OnDestroy {
	availableTimes: number[] = [1, 2, 3, 4, 5, 10, 15, 20, 30];
	timesTableForm = new UntypedFormGroup({
		input: new FormControl<number>(Math.round(Math.random() * 100) % 10, {
			nonNullable: true,
		}),
	});
	multiples: number[] = [];
	displayTime: string = '00:00';
	value: number = 100;

	selectedTime: number = 1; // Temps sélectionné en minutes
	isRunning: boolean = false; // État du compte à rebours
	mode: ProgressSpinnerMode = 'determinate';

	constructor(
		private electronIpc: ElectronIpcService,
		private translate: TranslateService,
		private router: Router,
		private countdownService: CountdownService // Injecte le service
	) {}

	ngOnInit(): void {
		// S'abonner aux changements du temps restant et de l'état du compte à rebours
		this.countdownService.remainingTime$.subscribe((remaining) => {
			this.updateDisplayTime(remaining);
		});

		this.countdownService.isRunning$.subscribe((isRunning) => {
			this.isRunning = isRunning;
		});

		// Charger le temps sauvegardé
		this.loadSavedTime();

		// Gestion de la table de multiplication
		this.electronIpc.receive<number[]>(
			WindowApiConst.MULTIPLES_OUTPUT,
			(output: number[]) => {
				this.multiples = output;
			}
		);

		this.timesTableForm.valueChanges.subscribe(() => {
			this.multiples = [];
		});

		this.onSubmit();
	}

	// Naviguer vers la page de paramètres sans mettre en pause le timer
	navigateToSettings() {
		this.router.navigate(['/settings']);
	}

	// Charger le temps sauvegardé à partir du localStorage et mettre à jour le service
	loadSavedTime() {
		const savedTime = localStorage.getItem('selectedTime');
		if (savedTime) {
			const selectedTime = +savedTime;
			this.selectedTime = selectedTime;
			this.countdownService.setSelectedTime(selectedTime); // Synchroniser avec le service
		}
	}

	// Gérer le changement de temps dans le service
	onTimeChange() {
		this.countdownService.setSelectedTime(this.selectedTime);
	}

	// Mettre à jour l'affichage du temps
	updateDisplayTime(remaining: number) {
		const minutes = Math.floor(remaining / 60);
		const seconds = remaining % 60;
		this.displayTime = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
		this.updateValue(remaining);
	}

	// Mettre à jour la valeur du spinner en fonction du temps restant
	updateValue(remaining: number) {
		const totalTime = this.countdownService.selectedTime * 60; // Utilise la valeur sélectionnée dans le service
		this.value = (remaining / totalTime) * 100;
	}

	// Basculer l'état du compte à rebours (lecture/pause)
	toggleCountdown() {
		this.countdownService.toggleCountdown();
	}

	// Envoyer les données à Electron
	onSubmit(): void {
		const input = this.timesTableForm.value.input;
		this.electronIpc.send(WindowApiConst.MULTIPLES_INPUT, input);
	}

	// Ajouter un zéro devant les nombres inférieurs à 10
	padZero(number_: number): string {
		return number_ < 10 ? '0' + number_ : number_.toString();
	}

	// Réinitialiser le compte à rebours
	resetCountdown() {
		this.countdownService.resetCountdown();
	}

	ngOnDestroy() {
		// Rien à faire ici, le service gère la destruction
	}
}
