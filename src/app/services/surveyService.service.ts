import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  constructor(private http: HttpClient) {}
  loadPayementMethods(token: any) {
    return this.http
      .get<any>(`${environment.apiUrl}GetAllSurveyPayment`, token)
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }
  saveSurvey(surveyData: any) {
    return this.http
      .post<any>(`${environment.apiUrl}save_survey`, surveyData)
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }

  postRedirect(url: string, data: any) {
    const form = document.createElement('form');
    form.action = url;
    form.method = 'POST';
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'SurveyRefrenceId';
    input.value = data.SurveyRefrenceId;
    form.appendChild(input);
    const input2 = document.createElement('input');
    input2.type = 'hidden';
    input2.name = 'JsonData';
    input2.value = JSON.stringify(data);
    form.appendChild(input2);
    document.body.appendChild(form);

    form.submit();
    document.body.removeChild(form);
  }
}
