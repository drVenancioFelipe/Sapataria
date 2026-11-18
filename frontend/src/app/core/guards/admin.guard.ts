import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from '../services/auth.service'

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService)
  const router = inject(Router)

  if (!auth.isAuthenticated()) {
    await auth.loadUser()
  }

  if (auth.userPerfil() === 'admin') {
    return true
  }

  return router.createUrlTree(['/dashboard'])
}
