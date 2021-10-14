import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Recipe } from './recipe.model';
import { DataStorageService } from '../shared/data-storage.service';
import { Observable, of } from 'rxjs';
import { RecipeService } from './recipe.service';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as RecipeActions from '../recipes/store/recipe.actions';
import { Actions, ofType } from '@ngrx/effects';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(
    private dataStorageService: DataStorageService,
    private recipesService: RecipeService,
    private store: Store<fromApp.AppState>,
    private actions$: Actions
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Recipe[] | Observable<Recipe[]> | Promise<Recipe[]> {
    // const recipes = this.recipesService.getRecipes();
    //
    // if (recipes.length === 0) {
    //   return this.dataStorageService.fetchRecipes();
    // } else {
    //   return recipes;
    // }

    return this.store.select('recipes')
      .pipe(
        take(1),
        map(recipesState => {
          return recipesState.recipes;
        }),
        switchMap(recipes => {
          if (recipes.length === 0) {
            this.store.dispatch(new RecipeActions.FetchRecipes());
            return this.actions$
              .pipe(
                ofType(RecipeActions.SET_RECIPES),
                take(1)
              );
          } else {
            return of(recipes);
          }
        })
      );


  }
}
