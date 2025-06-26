<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function getAllUsers(Request $request)
    {
        try {
            // Get current authenticated user
            $currentUser = Auth::user();

            if (!$currentUser) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Get users with their manager information
            $users = User::with('manager')->get();

            // Transform users to include manager name and add permission flags
            $transformedUsers = $users->map(function ($user) use ($currentUser) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'manager_id' => $user->manager_id,
                    'manager_name' => $user->manager ? $user->manager->name : null,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'can_edit' => $currentUser->canEdit($user),
                    'can_delete' => $currentUser->canDelete($user),
                ];
            });

            return response()->json([
                'users' => $transformedUsers,
                'current_user' => [
                    'id' => $currentUser->id,
                    'role' => $currentUser->role,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Get all users error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch users'], 500);
        }
    }

    public function createUser(Request $request)
    {
        try {
            $currentUser = Auth::user();

            if (!$currentUser) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Check if current user can create users (only admin and managers)
            if (!in_array($currentUser->role, ['admin', 'manager'])) {
                return response()->json(['error' => 'Unauthorized to create users'], 403);
            }

            // Custom validation messages
            $messages = [
                'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            ];

            // Validation rules
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:users',
                'email' => 'required|email|max:255|unique:users',
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/'
                ],
                'role' => 'required|in:user,manager,admin',
                'manager_id' => 'nullable|exists:users,id',
            ], $messages);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()->first()], 400);
            }

            $validatedData = $validator->validated();

            // Business rules validation
            if (isset($validatedData['manager_id']) && $validatedData['manager_id']) {
                $selectedManager = User::find($validatedData['manager_id']);
                if (!$selectedManager || !in_array($selectedManager->role, ['manager', 'admin'])) {
                    return response()->json(['error' => 'Selected manager must have manager or admin role'], 400);
                }
            }

            // Role-specific validation
            if ($validatedData['role'] === 'admin') {
                // Only admin can create admin users
                if ($currentUser->role !== 'admin') {
                    return response()->json(['error' => 'Only admin can create admin users'], 403);
                }
                // Admins don't have managers
                $validatedData['manager_id'] = null;
            }

            // Managers can only create users and assign themselves as manager
            if ($currentUser->role === 'manager' && $validatedData['role'] === 'manager') {
                return response()->json(['error' => 'Managers cannot create other managers'], 403);
            }

            if ($currentUser->role === 'manager' && $validatedData['manager_id'] && $validatedData['manager_id'] != $currentUser->id) {
                return response()->json(['error' => 'You can only assign yourself as manager'], 403);
            }

            // Create the user with email instantly verified
            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'role' => $validatedData['role'],
                'manager_id' => $validatedData['manager_id'],
                'email_verified_at' => now(), // Instantly verify email
            ]);

            // Load the user with manager information for response
            $createdUser = User::with('manager')->find($user->id);

            $responseUser = [
                'id' => $createdUser->id,
                'name' => $createdUser->name,
                'email' => $createdUser->email,
                'role' => $createdUser->role,
                'manager_id' => $createdUser->manager_id,
                'manager_name' => $createdUser->manager ? $createdUser->manager->name : null,
                'email_verified_at' => $createdUser->email_verified_at,
                'created_at' => $createdUser->created_at,
                'can_edit' => $currentUser->canEdit($createdUser),
                'can_delete' => $currentUser->canDelete($createdUser),
            ];

            return response()->json([
                'message' => 'User created successfully',
                'user' => $responseUser
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Create user error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create user'], 500);
        }
    }

    public function updateUser(Request $request, $id)
    {
        try {
            $currentUser = Auth::user();
            $targetUser = User::findOrFail($id);

            // Check if current user can edit target user
            if (!$currentUser->canEdit($targetUser)) {
                return response()->json(['error' => 'Unauthorized to edit this user'], 403);
            }

            // Get all possible managers (users with role 'manager' or 'admin')
            $possibleManagers = User::whereIn('role', ['manager', 'admin'])->pluck('id');

            $validatedData = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|max:255|unique:users,email,' . $id,
                'role' => 'sometimes|in:user,manager,admin',
                'manager_id' => 'sometimes|nullable|exists:users,id',
            ]);

            // Additional business rules
            if (isset($validatedData['manager_id'])) {
                // Validate manager_id business rules
                if ($validatedData['manager_id']) {
                    $selectedManager = User::find($validatedData['manager_id']);
                    if (!$selectedManager || !in_array($selectedManager->role, ['manager', 'admin'])) {
                        return response()->json(['error' => 'Selected manager must have manager or admin role'], 400);
                    }
                }

                // Prevent circular references
                if ($validatedData['manager_id'] == $id) {
                    return response()->json(['error' => 'User cannot be their own manager'], 400);
                }

                // Additional check for admin: they can assign any manager
                if ($currentUser->role !== 'admin' && $validatedData['manager_id']) {
                    // Non-admin users have limited manager assignment capabilities
                    if ($currentUser->role === 'manager' && $validatedData['manager_id'] !== $currentUser->id) {
                        return response()->json(['error' => 'You can only assign yourself as manager'], 403);
                    }
                }
            }

            // Role-specific validation
            if (isset($validatedData['role'])) {
                // Only admin can set admin role
                if ($validatedData['role'] === 'admin' && $currentUser->role !== 'admin') {
                    return response()->json(['error' => 'Only admin can assign admin role'], 403);
                }

                // If changing to admin, remove manager_id
                if ($validatedData['role'] === 'admin') {
                    $validatedData['manager_id'] = null;
                }
            }

            $targetUser->update($validatedData);

            // Return updated user with manager information
            $updatedUser = User::with('manager')->find($id);
            $responseUser = [
                'id' => $updatedUser->id,
                'name' => $updatedUser->name,
                'email' => $updatedUser->email,
                'role' => $updatedUser->role,
                'manager_id' => $updatedUser->manager_id,
                'manager_name' => $updatedUser->manager ? $updatedUser->manager->name : null,
                'email_verified_at' => $updatedUser->email_verified_at,
                'created_at' => $updatedUser->created_at,
                'can_edit' => $currentUser->canEdit($updatedUser),
                'can_delete' => $currentUser->canDelete($updatedUser),
            ];

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $responseUser
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->validator->errors()->first()], 400);
        } catch (\Exception $e) {
            \Log::error('Update user error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update user'], 500);
        }
    }

    public function deleteUser($id)
    {
        try {
            $currentUser = Auth::user();
            $targetUser = User::findOrFail($id);

            // Check if current user can delete target user
            if (!$currentUser->canDelete($targetUser)) {
                return response()->json(['error' => 'Unauthorized to delete this user'], 403);
            }

            // Check if user has subordinates
            if ($targetUser->subordinates()->count() > 0) {
                return response()->json(['error' => 'Cannot delete user with subordinates. Please reassign them first.'], 400);
            }

            $targetUser->delete();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Delete user error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete user'], 500);
        }
    }

    public function getManagers()
    {
        try {
            $currentUser = Auth::user();

            if (!$currentUser) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Get managers based on user role
            if ($currentUser->role === 'admin') {
                // Admin can see all managers and admins (for reassigning users)
                $managers = User::whereIn('role', ['manager', 'admin'])
                    ->select('id', 'name', 'role')
                    ->orderBy('name')
                    ->get();
            } else {
                // Non-admin users see limited managers
                $managers = User::whereIn('role', ['manager', 'admin'])
                    ->select('id', 'name', 'role')
                    ->orderBy('name')
                    ->get();
            }

            return response()->json($managers);
        } catch (\Exception $e) {
            \Log::error('Get managers error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch managers'], 500);
        }
    }
}
