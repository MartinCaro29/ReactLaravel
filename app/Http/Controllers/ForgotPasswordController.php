<?php

namespace App\Http\Controllers;

use App\Models\EmailVerificationToken;
use App\Models\PasswordResetToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ForgotPasswordController extends Controller
{
    private function sendResetTokenEmail(User $user, string $token, bool $isResend = false)
    {
        $subject = $isResend ? 'Kodi i ri për ndryshimin e fjalëkalimit' : 'Ndryshimi i fjalëkalimit';
        $messageBody = "Ky është kodi juaj për ndryshimin e fjalëkalimit: {$token}. Kodi do të skadojë pas 10 minutash.";

        try {
            Mail::raw($messageBody, function ($message) use ($user, $subject) {
                $message->to($user->email)
                    ->from('electroman784@gmail.com')
                    ->subject($subject);
            });
            return true;
        } catch (\Exception $e) {
            \Log::error('Email sending error: ' . $e->getMessage());
            return false;
        }
    }



    /**
     * Request password reset - sends verification code to email
     */
    public function requestPasswordReset(Request $request, bool $isResend = false)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Ky email nuk ekziston.'], 404);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Ky email nuk ekziston.'], 404);
        }

        // Generate 6-digit token
        $token = PasswordResetToken::generateToken();

        // Create or update password reset token
        PasswordResetToken::updateOrCreate(
            ['email' => $request->email],
            [
                'token' => $token,
                'expires_at' => now()->addMinutes(10),
                'created_at' => now(),
            ]
        );

        // Send email (not a resend)
        if (!$this->sendResetTokenEmail($user, $token, $isResend)) {
            return response()->json(['message' => 'Gabim gjatë dërgimit të email-it.'], 500);
        }

        return response()->json([
            'message' => 'Kodi i verifikimit u dërgua në email-in tuaj.',
            'email' => $user->email
        ]);
    }

    /**
     * Verify reset code (optional step - can be used for two-step verification)
     */
    public function verifyResetCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid request data.'], 400);
        }

        $resetToken = PasswordResetToken::where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$resetToken) {
            return response()->json(['message' => 'Kodi i verifikimit është i pavlefshëm.'], 400);
        }

        if ($resetToken->isExpired()) {
            $resetToken->delete();
            return response()->json(['message' => 'Kodi i verifikimit ka skaduar.'], 400);
        }

        return response()->json([
            'message' => 'Kodi u verifikua me sukses.',
            'email' => $request->email
        ]);
    }

    /**
     * Reset password using token and new password
     */
    public function resetPassword(Request $request)
    {
        // Check if user is authenticated
        $isAuthenticated = Auth::check();

        if ($isAuthenticated) {
            // For authenticated users, we don't need email or token validation
            $validator = Validator::make($request->all(), [
                'new_password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/'
                ],
            ], [
                'new_password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Invalid request data.',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = Auth::user();
        } else {
            // For non-authenticated users, validate email and token
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'token' => 'required|string',
                'new_password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/'
                ],
            ], [
                'new_password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Invalid request data.',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            // Skip token validation if it's "auth" (for authenticated users)
            if ($request->token !== 'auth') {
                $resetToken = PasswordResetToken::where('email', $request->email)
                    ->where('token', $request->token)
                    ->first();

                if (!$resetToken) {
                    return response()->json(['message' => 'Kodi i verifikimit është i pavlefshëm.'], 400);
                }

                if ($resetToken->isExpired()) {
                    $resetToken->delete();
                    return response()->json(['message' => 'Token has expired.'], 400);
                }

                // Delete the token after successful validation
                $resetToken->delete();
            }
        }

        // Update user's password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password successfully updated.',
            'email' => $user->email,
        ]);
    }

    /**
     * Resend verification code (alias for requestPasswordReset)
     */
    public function resendVerification(Request $request)
    {
        return $this->requestPasswordReset($request, true);
    }
}
