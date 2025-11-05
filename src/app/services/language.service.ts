import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private directionSource = new BehaviorSubject<'ltr' | 'rtl'>('ltr');
  currentDirection$ = this.directionSource.asObservable();

  private languageSource = new BehaviorSubject<'en' | 'ar'>('en');
  currentLanguage$ = this.languageSource.asObservable();
  setDirection(dir: 'ltr' | 'rtl') {
    this.directionSource.next(dir);
  }
  setLanguage(lang: 'en' | 'ar') {
    this.languageSource.next(lang);
  }
}
