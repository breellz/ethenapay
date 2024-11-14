import {
  signUp
} from "./signUp.controller"
import {
  signIn
} from "./signIn.controller"
import {
  signOut
} from "./signOut.controller"
import {
  requestForgotPassword,
  verifyPasswordChangeOtp,
  changePassword,
  resetPassword

} from "./passwordRecovery.controller"

import {
  requestEmailVerification,
  verifyEmail
} from './verification.controller'
export default {
  signUp,
  signIn,
  signOut,
  requestForgotPassword,
  verifyPasswordChangeOtp,
  changePassword,
  resetPassword,
  requestEmailVerification,
  verifyEmail
}