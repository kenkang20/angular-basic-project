# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 12 practice project demonstrating a recipe management and shopping list application with NgRx state management, lazy loading, and Firebase authentication.

## Essential Commands

**Development:**
- `npm start` - Start dev server at http://localhost:4200/
- `npm run watch` - Build with watch mode (development configuration)

**Build:**
- `npm run build` - Production build to dist/basic-project
- Build output path: `dist/basic-project`

**Testing:**
- `npm test` - Run Jasmine/Karma tests in Chrome
- Tests run in watch mode by default
- Coverage reports generated in `./coverage/basic-project`

**Code Generation:**
- `ng generate component <name>` - Generate new component
- `ng generate service <name>` - Generate new service
- Also supports: directive, pipe, guard, interface, enum, module

## Architecture

### NgRx State Management

The application uses NgRx for centralized state management with a modular architecture:

**Root State Structure** (`src/app/store/app.reducer.ts`):
```typescript
interface AppState {
  shoppingList: State;
  auth: State;
  recipes: State;
}
```

**Store Organization Pattern:**
Each feature module (auth, recipes, shopping-list) contains a `/store` subdirectory with:
- `*.actions.ts` - Action creators and action types
- `*.reducer.ts` - Reducer functions and state interfaces
- `*.effects.ts` - Side effects for async operations (where applicable)

**Effects Registration:**
- Root effects registered in `app.module.ts`: `AuthEffects`, `RecipeEffects`
- Effects handle HTTP calls, routing, localStorage, and timers
- Non-dispatching effects marked with `{ dispatch: false }`

**Store Setup:**
- `StoreModule.forRoot(fromApp.appReducer)` - Root store initialization
- `StoreDevtoolsModule` - Redux DevTools integration (logOnly in production)
- `StoreRouterConnectingModule` - Router state synchronization

### Module Architecture

**Lazy Loading:**
All feature modules are lazy-loaded via routing:
- `/recipes` → `RecipesModule`
- `/shopping-list` → `ShoppingListModule`
- `/auth` → `AuthModule`

Preloading strategy: `PreloadAllModules` (loads modules in background after initial load)

**Module Structure:**
- `AppModule` - Root module with HttpClient, Store, Effects, Router
- `CoreModule` - Core services and interceptors
- `SharedModule` - Shared components, directives, and pipes
- Feature modules - Self-contained with routing modules

### Authentication Flow

**Firebase Integration:**
- Uses Firebase Authentication REST API
- API key configured in `src/environments/environment.ts` as `firebaseAPIKey`
- Endpoints: `signUp`, `signInWithPassword`

**Auth Implementation:**
- Token stored in localStorage as `userData`
- Auto-login on app initialization via `AUTO_LOGIN` action
- Auto-logout timer managed by `AuthService.setLogoutTimer()`
- HTTP requests authenticated via `AuthInterceptorService`
- Route protection via `AuthGuard`

**Auth Effects** (`src/app/auth/store/auth.effects.ts`):
- `authSignup` - Handle signup with Firebase API
- `authLogin` - Handle login with Firebase API
- `authAutoLogin` - Restore session from localStorage
- `authLogout` - Clear session and redirect
- `authRedirect` - Navigate after successful auth

### Data Persistence

**Recipe Data:**
- Stored in Firebase Realtime Database
- Base URL: `https://ng-course-recipe-book-c25b7-default-rtdb.firebaseio.com/recipes.json`
- `FETCH_RECIPES` action - Load recipes from Firebase
- `STORE_RECIPES` action - Save recipes to Firebase (non-dispatching effect)
- Uses `withLatestFrom` to combine recipe state with action

**Recipe Resolution:**
- `RecipesResolverService` - Pre-fetch recipes before route activation
- Prevents empty state when navigating directly to recipe routes

## Key Patterns

**NgRx Selector Usage:**
Components select slices of state using the store's select method:
```typescript
this.store.select('auth')  // Select auth state
this.store.select('recipes')  // Select recipes state
```

**Action Dispatching:**
Effects and components dispatch actions to trigger state changes:
```typescript
this.store.dispatch(new AuthActions.LoginStart({ email, password }))
```

**Effect Side Effect Patterns:**
- Use `switchMap` for cancellable HTTP requests
- Use `tap` for side effects (navigation, localStorage, timers)
- Use `catchError` to handle errors and return error actions
- Use `map` to transform responses into actions

**Environment Configuration:**
- Development: `src/environments/environment.ts`
- Production: `src/environments/environment.prod.ts`
- File replacement configured in `angular.json` for production builds

## Important Notes

- Angular version: 12.0.2
- TypeScript version: 4.2.3
- Bootstrap 3.4.1 included globally via angular.json styles
- Component prefix: `app`
- When adding new feature state, update `src/app/store/app.reducer.ts` to include in AppState interface and appReducer map
- Effects must be registered in `EffectsModule.forRoot()` in app.module.ts
- Firebase API key required in environment files for auth to work
