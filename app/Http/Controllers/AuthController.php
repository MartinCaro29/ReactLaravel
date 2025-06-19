<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\EmailVerificationToken;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AuthController extends Controller


{

    private function sendVerificationEmail(User $user, string $token, bool $isResend = false)
    {
        $subject = $isResend ? 'Kodi i ri i Verifikimit' : 'Verifikimi i Email-it';
        $messageBody = $isResend
            ? "Ky është kodi juaj i ri i verifikimit: {$token}. Kodi do të skadojë pas 10 minutash."
            : "Ky është kodi juaj i verifikimit: {$token}. Kodi do të skadojë pas 10 minutash.";

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

    public function register(Request $request)
    {
        // Custom validation messages in Albanian
        $messages = [
            'name.required' => 'Të gjitha fushat janë të detyrueshme.',
            'email.required' => 'Të gjitha fushat janë të detyrueshme.',
            'password.required' => 'Të gjitha fushat janë të detyrueshme.',
            'password.min' => 'Fjalëkalimi duhet të ketë të paktën 8 karaktere.',
            'email.email' => 'Formati i email-it nuk është i vlefshëm.',
            'email.unique' => 'Ky email është përdorur tashmë.',
            'name.unique' => 'Ky përdorues ekziston tashmë.',
        ];

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ], $messages);

        if ($validator->fails()) {
            return response()->json($validator->errors()->first(), 400);
        }

        try {
            // Check if both email and username exist (matching Node.js logic)
            $emailExists = User::where('email', $request->email)->exists();
            $usernameExists = User::where('name', $request->name)->exists();

            if ($emailExists && $usernameExists) {
                return response()->json('Ky përdorues dhe ky email ekzistojnë tashmë.', 400);
            }

            if ($usernameExists) {
                return response()->json('Ky përdorues ekziston tashmë.', 400);
            }

            if ($emailExists) {
                return response()->json('Ky email është përdorur tashmë.', 400);
            }

            // Create new user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified' => false,
            ]);

            $token = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
            $expiresAt = Carbon::now()->addMinutes(10);

            EmailVerificationToken::updateOrCreate(
                ['user_id' => $user->id],
                ['token' => $token, 'expires_at' => $expiresAt]
            );

            // Send verification email using new method
            $emailSent = $this->sendVerificationEmail($user, $token, false);

            if ($emailSent) {
                return response()->json('Përdoruesi u regjistrua. Verifikimi i email-it u dërgua.', 200);
            } else {
                return response()->json('Përdoruesi u regjistrua, por verifikimi i email-it dështoi. Ju lutemi kontaktoni mbështetjen.', 200);
            }


        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage());
            return response()->json('Diçka nuk shkon. Ju lutemi provoni përsëri më vonë.', 500);
        }
    }

    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json('Invalid request data.', 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json('User not found.', 400);
        }

        if ($user->email_verified_at) {
            return response()->json('Email already verified.', 400);
        }

        $verification = EmailVerificationToken::where('user_id', $user->id)
            ->where('token', $request->token)
            ->first();

        if (!$verification) {
            return response()->json('Token not found or expired.', 400);
        }

        if ($verification->isExpired()) {
            $verification->delete();
            return response()->json('Token has expired.', 400);
        }

        // Mark user as verified
        $user->update([
            'email_verified_at' => now()->toDateTimeString(),
        ]);

        // Delete the verification token
        $verification->delete();



        // Set cookie for 24 hours (1440 minutes)
        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'email_verified' => 1,
            'user' => $user,
        ]);
    }

    public function resendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json('Invalid email format.', 400);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json('Ky email nuk ekziston.', 404);
            }

            if ($user->email_verified) {
                return response()->json('Email-i është verifikuar tashmë.', 400);
            }

            // Generate new token
            $token = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
            $expiresAt = Carbon::now()->addMinutes(10);

            EmailVerificationToken::updateOrCreate(
                ['user_id' => $user->id],
                ['token' => $token, 'expires_at' => $expiresAt]
            );

            // Send verification email using new method with resend flag
            $emailSent = $this->sendVerificationEmail($user, $token, true);

            if ($emailSent) {
                return response()->json('Kodi i verifikimit u ridërgua me sukses.', 200);
            } else {
                return response()->json('Diçka nuk shkon gjatë dërgimit të email-it. Ju lutemi provoni përsëri më vonë.', 500);
            }


        } catch (\Exception $e) {
            \Log::error('Resend verification error: ' . $e->getMessage());
            return response()->json('Diçka nuk shkon. Ju lutemi provoni përsëri më vonë.', 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid credentials.'], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials.'], 401);
        }

        if (!$user->email_verified_at) {
            $code = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
            EmailVerificationToken::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'token' => $code,
                    'expires_at' => now()->addMinutes(10),
                ]
            );

            $this->sendVerificationEmail($user, $code, false);

            return response()->json([
                'needsVerification' => true,
                'email' => $user->email,
            ], 200);
        }

        // For Sanctum stateful authentication, use attempt instead of Auth::login
        if (Auth::attempt(['email' => $request->email, 'password' => $request->password,], $request->remember)) {
            $request->session()->regenerate();

            return response()->json([
                'user' => Auth::user(),
            ]);
        }

        return response()->json(['error' => 'Authentication failed'], 401);
    }



    public function logout(Request $request)
    {
        // Log out the user - this clears the authentication
        auth()->guard('web')->logout();

        // Invalidate the session
        $request->session()->invalidate();

        // Regenerate the CSRF token
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }


    // Add method to check authentication status
    public function user(Request $request)
    {
        // For Sanctum stateful auth, check if user is authenticated
        if (Auth::check()) {
            return response()->json(['user' => Auth::user()]);
        }

        return response()->json(['error' => 'Unauthenticated'], 401);
    }
}
