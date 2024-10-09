import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class CountdownService implements OnDestroy {
	private intervalId: number | undefined; // Type correct pour intervalId
	private remainingTimeSubject = new BehaviorSubject<number>(0);
	private isRunningSubject = new BehaviorSubject<boolean>(false);
	public selectedTime: number = 1; // Temps sélectionné en minutes

	remainingTime$ = this.remainingTimeSubject.asObservable();
	isRunning$ = this.isRunningSubject.asObservable();

	constructor() {
		this.loadSavedTime(); // Charge le temps sauvegardé au démarrage
	}

	// Charger la valeur depuis le localStorage
	private loadSavedTime(): void {
		const savedTime = localStorage.getItem('selectedTime');
		if (savedTime) {
			this.selectedTime = +savedTime; // Convertir en nombre
		}
		this.resetCountdown(); // Initialise le compte à rebours avec la valeur sauvegardée
	}

	// Sauvegarder la valeur sélectionnée dans le localStorage
	private saveSelectedTime(): void {
		localStorage.setItem('selectedTime', this.selectedTime.toString());
	}

	setSelectedTime(time: number): void {
		this.selectedTime = time;
		this.saveSelectedTime(); // Sauvegarde dans localStorage
		this.resetCountdown(); // Réinitialise le compte à rebours
	}

	toggleCountdown(): void {
		if (this.isRunningSubject.getValue()) {
			clearInterval(this.intervalId!); // Utilise le non-null assertion operator
			this.isRunningSubject.next(false);
		} else {
			if (this.remainingTimeSubject.getValue() === 0) {
				this.remainingTimeSubject.next(this.selectedTime * 60); // Convertir le temps en secondes
			}
			this.startCountdown(); // Démarrer ou reprendre le compte à rebours
		}
	}

	private startCountdown(): void {
		this.isRunningSubject.next(true);

		this.intervalId = window.setInterval(() => {
			// Utilise window.setInterval pour obtenir le bon type
			const remaining = this.remainingTimeSubject.getValue();
			if (remaining > 0) {
				this.remainingTimeSubject.next(remaining - 1);
			} else {
				clearInterval(this.intervalId!);
				this.isRunningSubject.next(false);
			}
		}, 1000);
	}

	resetCountdown(): void {
		clearInterval(this.intervalId!);
		this.remainingTimeSubject.next(this.selectedTime * 60); // Remettre à la valeur sélectionnée
	}

	ngOnDestroy(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}
}
