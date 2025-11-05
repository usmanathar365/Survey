import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

import { SharedModule } from 'src/app/sharedModule';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  imports: [SharedModule],
})
export class LanguageComponent implements OnInit {
  flag: string = 'us';
  defaultLang = 'English';
  constructor(
    private translate: TranslateService,
    private langService: LanguageService
  ) {
    translate.addLangs(['en', 'ar']);
    translate.setDefaultLang('en');

    const savedLang =
      localStorage.getItem('lang') || translate.getBrowserLang() || 'en';
    this.changeLocale(savedLang);
  }

  ngOnInit() {}

  changeLocale(lang) {
    this.flag = lang == 'en' ? (this.flag = 'us') : (this.flag = 'sa');
    this.defaultLang =
      lang == 'en'
        ? (this.defaultLang = 'English')
        : (this.defaultLang = 'العربية');
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.langService.setLanguage(lang);
    this.langService.setDirection(dir);
  }
}
