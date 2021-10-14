import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from '../../auth/store/auth.actions';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as RecipesActions from './recipe.actions';
import { Recipe } from '../recipe.model';
import { HttpClient } from '@angular/common/http';
import { RecipeService } from '../recipe.service';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import { Injectable } from '@angular/core';

@Injectable()
export class RecipeEffects {
  fetchRecipes = createEffect(
    () => {
      return this.$actions.pipe(
        ofType(RecipesActions.FETCH_RECIPES),
        switchMap(() => {
          return this.http
            .get<Recipe[]>(
              'https://ng-course-recipe-book-c25b7-default-rtdb.firebaseio.com/recipes.json',
            )
        }),
        map(recipes => {
          return recipes.map(recipe => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : []
            };
          });
        }),
        map(recipes => {
          return new RecipesActions.SetRecipes(recipes);
        })
      );
    }
  );

  storeRecipes = createEffect(
    () => {
      return this.$actions.pipe(
        ofType(RecipesActions.STORE_RECIPES),
        withLatestFrom(this.store.select('recipes')),
        switchMap(([actionData, recipesState]) => {
          return this.http
            .put(
              'https://ng-course-recipe-book-c25b7-default-rtdb.firebaseio.com/recipes.json',
              recipesState.recipes
            )
        })
      );
    },
    { dispatch: false }
  );

  constructor(
    private $actions: Actions,
    private http: HttpClient,
    private store: Store<fromApp.AppState>
  ) {}
}
