import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { interval, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-success-confirmation',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './success-confirmation.component.html',
  styleUrl: './success-confirmation.component.scss'
})
export class SuccessConfirmationComponent implements OnInit, OnDestroy {
  countdown: number = 30;
  private countdownSubscription?: Subscription;
  private totalTime: number = 30; // Total countdown time in seconds
  circumference: number = 2 * Math.PI * 16; // 2πr where r=16
constructor(private route: ActivatedRoute) {}
  get strokeDashoffset(): number {
    const progress = this.countdown / this.totalTime;
    return this.circumference * (1 - progress);
  }

  ngOnInit(): void {
    this.startCountdown();
    this.route.queryParamMap.subscribe((params) => {
      const data = params.get('s');
      if (data) {
         
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  startCountdown(): void {
    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        if (this.countdownSubscription) {
          this.countdownSubscription.unsubscribe();
        }
      }
    });
  }

  goToMessage(): void {
    // Handle navigation to message or emit event
    console.log('Navigate to message');
    // You can add router navigation here if needed
  }
}
