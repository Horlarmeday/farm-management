import {
  AdminCreateUserRequest,
  LoginRequest,
  Status,
  UserResponse,
  UserStatus,
} from '../../../shared/src/types';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Role } from '../entities/Role';
import { User } from '../entities/User';
import { ApiError } from '../utils/ApiError';
import { generateTokens, refreshAccessToken, TokenResponse } from '../utils/jwt';

export class AuthService {
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  // ============================================================================
  // USER CREATION & MANAGEMENT
  // ============================================================================

  /**
   * Creates a new user with complete information (Admin/HR only)
   * @param userData - Complete user information
   * @returns Promise<UserResponse> - Created user response
   */
  async createUser(userData: AdminCreateUserRequest): Promise<UserResponse> {
    await this.validateUserCreationData(userData);

    const role = await this.getRoleById(userData.roleId);
    const user = await this.buildUserEntity(userData, role);

    const savedUser = await this.userRepository.save(user);

    return this.buildUserResponse(savedUser, role);
  }

  /**
   * Validates user creation data for uniqueness and completeness
   * @param userData - User data to validate
   */
  private async validateUserCreationData(userData: AdminCreateUserRequest): Promise<void> {
    // Check email uniqueness
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }
  }

  /**
   * Retrieves role by ID with validation
   * @param roleId - Role ID to find
   * @returns Promise<Role> - Found role
   */
  private async getRoleById(roleId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    return role;
  }

  /**
   * Builds User entity from creation data
   * @param userData - User creation data
   * @param role - Associated role
   * @returns User - Built user entity
   */
  private async buildUserEntity(userData: AdminCreateUserRequest, role: Role): Promise<User> {
    const user = new User();

    // Basic Information
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.email = userData.email;
    user.password = userData.password;
    user.phone = userData.phone;

    // Employment Details
    user.roleId = userData.roleId;
    user.role = role;
    user.departmentId = userData.department;
    user.employeeId = await this.generateEmployeeId();
    user.hireDate = userData.hireDate;
    user.salary = userData.salary;
    user.status = userData.status as UserStatus;

    // Personal Information
    user.dateOfBirth = userData.dateOfBirth;
    user.gender = userData.gender;
    user.bio = userData.bio;

    // Address Information
    user.address = userData.address;
    user.city = userData.city;
    user.state = userData.state;
    user.country = userData.country;
    user.postalCode = userData.postalCode;

    // Emergency Contact
    user.emergencyContact = userData.emergencyContact;

    // System Settings
    user.isActive = userData.isActive;
    user.isEmailVerified = userData.isEmailVerified || false;
    user.preferences = userData.preferences;

    return user;
  }

  /**
   * Generates a unique employee ID
   * @returns Promise<string> - Generated employee ID
   */
  private async generateEmployeeId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearPrefix = currentYear.toString().slice(-2); // Last 2 digits of year

    // Get the count of employees for this year using raw query
    const result = await this.userRepository
      .createQueryBuilder('user')
      .where('user.employeeId LIKE :pattern', { pattern: `EMP${yearPrefix}%` })
      .getCount();

    // Generate sequential number with leading zeros
    const sequenceNumber = (result + 1).toString().padStart(4, '0');

    return `EMP${yearPrefix}${sequenceNumber}`;
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Authenticates user and returns tokens
   * @param loginData - Login credentials
   * @returns Promise<{user: UserResponse, tokens: TokenResponse}> - User and tokens
   */
  async authenticateUser(
    loginData: LoginRequest,
  ): Promise<{ user: UserResponse; tokens: TokenResponse }> {
    const user = await this.findUserByEmail(loginData.email);

    this.validateUserForLogin(user);
    await this.validatePassword(user, loginData.password);

    const tokens = generateTokens(user);
    await this.updateUserLoginInfo(user, tokens.refreshToken, loginData.ipAddress);

    return {
      user: this.buildUserResponse(user, user.role),
      tokens,
    };
  }

  /**
   * Finds user by email with all necessary relations
   * @param email - User email
   * @returns Promise<User> - Found user
   */
  private async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        phone: true,
        avatar: true,
        employeeId: true,
        department: true,
        bio: true,
        salary: true,
        status: true,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        hireDate: true,
        terminationDate: true,
        emergencyContact: true,
        preferences: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    return user;
  }

  /**
   * Validates user status for login
   * @param user - User to validate
   */
  private validateUserForLogin(user: User): void {
    if (!user.isActive) {
      throw new ApiError(401, 'Account is deactivated');
    }
  }

  /**
   * Validates user password
   * @param user - User entity
   * @param password - Password to validate
   */
  private async validatePassword(user: User, password: string): Promise<void> {
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }
  }

  /**
   * Updates user login information
   * @param user - User to update
   * @param refreshToken - New refresh token
   * @param ipAddress - Login IP address
   */
  private async updateUserLoginInfo(
    user: User,
    refreshToken: string,
    ipAddress?: string,
  ): Promise<void> {
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  /**
   * Refreshes access token using refresh token
   * @param refreshToken - Current refresh token
   * @returns Promise<TokenResponse> - New tokens
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const tokens = await refreshAccessToken(refreshToken);
      await this.updateUserRefreshToken(refreshToken, tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  /**
   * Updates user's refresh token
   * @param oldToken - Old refresh token
   * @param newToken - New refresh token
   */
  private async updateUserRefreshToken(oldToken: string, newToken: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { refreshToken: oldToken },
    });

    if (user) {
      user.refreshToken = newToken;
      await this.userRepository.save(user);
    }
  }

  /**
   * Logs out user by clearing refresh token
   * @param userId - User ID to logout
   */
  async logoutUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user) {
      user.refreshToken = null;
      await this.userRepository.save(user);
    }
  }

  // ============================================================================
  // PASSWORD MANAGEMENT
  // ============================================================================

  /**
   * Changes user password with validation
   * @param userId - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  async changeUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findUserById(userId);
    await this.validateCurrentPassword(user, currentPassword);
    await this.updateUserPassword(user, newPassword);
  }

  /**
   * Finds user by ID for password operations
   * @param userId - User ID
   * @returns Promise<User> - Found user
   */
  private async findUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  /**
   * Validates current password
   * @param user - User entity
   * @param currentPassword - Current password to validate
   */
  private async validateCurrentPassword(user: User, currentPassword: string): Promise<void> {
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }
  }

  /**
   * Updates user password
   * @param user - User to update
   * @param newPassword - New password
   */
  private async updateUserPassword(user: User, newPassword: string): Promise<void> {
    user.password = newPassword;
    await this.userRepository.save(user);
  }

  /**
   * Initiates password reset process
   * @param email - User email
   * @returns Promise<string> - Reset token
   */
  async initiatePasswordReset(email: string): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const resetToken = user.generatePasswordResetToken();
    await this.userRepository.save(user);

    return resetToken;
  }

  /**
   * Resets password using reset token
   * @param token - Reset token
   * @param newPassword - New password
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.clearPasswordResetToken();
    await this.userRepository.save(user);
  }

  // ============================================================================
  // EMAIL VERIFICATION
  // ============================================================================

  /**
   * Verifies user email using verification token
   * @param token - Email verification token
   */
  async verifyUserEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await this.userRepository.save(user);
  }

  // ============================================================================
  // USER PROFILE
  // ============================================================================

  /**
   * Retrieves user profile by ID
   * @param userId - User ID
   * @returns Promise<UserResponse> - User profile
   */
  async getUserProfile(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return this.buildUserResponse(user, user.role);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Builds UserResponse from User entity
   * @param user - User entity
   * @param role - User role
   * @returns UserResponse - Formatted user response
   */
  private buildUserResponse(user: User, role: Role): UserResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      employeeId: user.employeeId,
      department: user.department?.name || undefined,
      bio: user.bio,
      salary: user.salary,
      status: user.status as Status,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      city: user.city,
      state: user.state,
      country: user.country,
      postalCode: user.postalCode,
      hireDate: user.hireDate,
      terminationDate: user.terminationDate,
      emergencyContact: user.emergencyContact,
      preferences: user.preferences,
      role: {
        id: role.id,
        name: role.name as string,
        description: role.description || '',
        isActive: role.isActive,
        isSystemRole: role.isSystemRole,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
