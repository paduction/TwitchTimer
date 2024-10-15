import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class CountdownService implements OnDestroy {
	private intervalId: number | undefined;
	private remainingTimeSubject = new BehaviorSubject<number>(0);
	private isRunningSubject = new BehaviorSubject<boolean>(false);
	private filePath: string = '';
	public selectedTime: number = 1; // Temps sélectionné en minutes

	remainingTime$ = this.remainingTimeSubject.asObservable();
	isRunning$ = this.isRunningSubject.asObservable();
	public selectedDirectory: string = ''; // Répertoire sélectionné

	constructor() {
		this.loadSavedState(); // Charge l'état sauvegardé (temps restant, état d'exécution)
	}

	setFilePath(filePath: string) {
		this.filePath = filePath;
		this.saveState(); // Sauvegarde dans le localStorage
	}

	getFilePath(): string {
		return this.filePath;
	}

	getSelectedTime(): number {
		return this.selectedTime;
	}

	// Charger l'état depuis le localStorage
	private loadSavedState(): void {
		const savedTime = localStorage.getItem('selectedTime');
		if (savedTime) {
			this.selectedTime = +savedTime;
		}

		const savedRemainingTime = localStorage.getItem('remainingTime');
		if (savedRemainingTime) {
			this.remainingTimeSubject.next(+savedRemainingTime);
		} else {
			this.resetCountdown(); // Réinitialise si rien n'est sauvegardé
		}

		const savedIsRunning = localStorage.getItem('isRunning');
		if (savedIsRunning) {
			this.isRunningSubject.next(savedIsRunning === 'true');
			if (savedIsRunning === 'true') {
				this.startCountdown(); // Reprendre si le compte à rebours est actif
			}
		}

		// Charger le filePath sauvegardé
		const savedFilePath = localStorage.getItem('filePath');
		if (savedFilePath) {
			this.filePath = savedFilePath;
		}
	}

	// Sauvegarder l'état dans le localStorage
	// Sauvegarder l'état dans le localStorage
	private saveState(): void {
		localStorage.setItem('selectedTime', this.selectedTime.toString());
		localStorage.setItem(
			'remainingTime',
			this.remainingTimeSubject.getValue().toString()
		);
		localStorage.setItem(
			'isRunning',
			this.isRunningSubject.getValue().toString()
		);

		if (this.filePath) {
			localStorage.setItem('filePath', this.filePath); // Sauvegarder le filePath
		}
	}

	setSelectedTime(time: number): void {
		this.selectedTime = time;
		this.saveState(); // Sauvegarder dans le localStorage
		//this.resetCountdown(); // Réinitialiser le compte à rebours
	}

	toggleCountdown(): void {
		if (this.isRunningSubject.getValue()) {
			clearInterval(this.intervalId!);
			this.isRunningSubject.next(false);
		} else {
			if (this.remainingTimeSubject.getValue() === 0) {
				this.remainingTimeSubject.next(this.selectedTime * 60); // Convertir le temps en secondes
			}
			this.startCountdown();
		}
		this.saveState(); // Sauvegarder l'état chaque fois qu'on change
	}

	private startCountdown(): void {
		this.isRunningSubject.next(true);

		this.intervalId = window.setInterval(() => {
			const remaining = this.remainingTimeSubject.getValue();
			if (remaining > 0) {
				this.remainingTimeSubject.next(remaining - 1);
			} else {
				clearInterval(this.intervalId!);
				this.isRunningSubject.next(false);
			}
			this.saveState(); // Sauvegarder à chaque tick
		}, 1000);
	}

	resetCountdown(): void {
		clearInterval(this.intervalId!);
		this.remainingTimeSubject.next(this.selectedTime * 60);
		this.isRunningSubject.next(false);
		this.saveState(); // Sauvegarder après la réinitialisation
	}

	ngOnDestroy(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}
}
