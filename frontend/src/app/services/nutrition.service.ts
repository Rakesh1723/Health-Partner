import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface NutritionData {
  calories: number;
  totalWeight: number;
  dietLabels: string[];
  healthLabels: string[];
  totalNutrients: {
    ENERC_KCAL: { quantity: number; unit: string; };
    PROCNT: { quantity: number; unit: string; };
    FAT: { quantity: number; unit: string; };
    CHOCDF: { quantity: number; unit: string; };
  };
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private apiUrl = 'https://api.edamam.com/api/nutrition-data';
  private appId = 'd1247c82';
  private appKey = 'efd62b00ddabc707ec25e27b835784e4';

  constructor(private http: HttpClient) {}

  getNutritionData(foodItem: string): Observable<{
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  }> {
    const params = new HttpParams()
      .set('app_id', this.appId)
      .set('app_key', this.appKey)
      .set('nutrition-type', 'cooking')
      .set('ingr', foodItem);

    return this.http.get<NutritionData>(this.apiUrl, { params }).pipe(
      map(response => {
        return {
          calories: Math.round(response.totalNutrients.ENERC_KCAL?.quantity || 0),
          protein: Math.round(response.totalNutrients.PROCNT?.quantity || 0),
          fat: Math.round(response.totalNutrients.FAT?.quantity || 0),
          carbs: Math.round(response.totalNutrients.CHOCDF?.quantity || 0)
        };
      })
    );
  }
} 