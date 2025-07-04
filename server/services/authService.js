const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/firebase");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

class AuthService {
  // Register new user
  async register(userData) {
    const {
      name,
      email,
      password,
      role,
      nim,
      program,
      angkatan,
      phone,
      institution,
      termsAccepted,
    } = userData;

    // Check if user already exists
    const existingUserQuery = await db
      .collection("users")
      .where("email", "==", email.toLowerCase())
      .get();

    if (!existingUserQuery.empty) {
      throw new Error("User already exists with this email");
    }

    // For mahasiswa, check if NIM already exists
    if (role === "mahasiswa" && nim) {
      const existingNimQuery = await db
        .collection("users")
        .where("nim", "==", nim)
        .get();

      if (!existingNimQuery.empty) {
        throw new Error("NIM already exists");
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user document
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      profile: {
        bio: "",
        phone: phone || "",
        linkedin: "",
        github: "",
        portfolio: "",
        behance: "",
        avatar: null,
      },
    };

    // Add role-specific fields
    if (role === "mahasiswa") {
      newUser.nim = nim;
      newUser.program = program;
      newUser.angkatan = angkatan;
    } else if (role === "pengunjung") {
      newUser.institution = institution || "";
    }

    // Save to Firestore
    const userRef = await db.collection("users").add(newUser);

    // Generate JWT
    const token = jwt.sign(
      {
        uid: userRef.id,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data without password
    const { password: _, ...userResponse } = newUser;

    return {
      success: true,
      message: "Registration successful",
      data: {
        token,
        user: {
          uid: userRef.id,
          ...userResponse,
        },
      },
    };
  }

  // Login user
  async login(loginData) {
    const { email, password, role } = loginData;

    // Find user by email and role
    const userQuery = await db
      .collection("users")
      .where("email", "==", email.toLowerCase())
      .where("role", "==", role)
      .get();

    if (userQuery.empty) {
      throw new Error("Invalid credentials");
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Check password
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Check if user is active
    if (userData.status !== "active") {
      throw new Error("Account is inactive or banned");
    }

    // Update last login
    await userDoc.ref.update({
      lastLogin: new Date(),
      updatedAt: new Date(),
    });

    // Generate JWT
    const token = jwt.sign(
      {
        uid: userDoc.id,
        email: userData.email,
        role: userData.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data without password
    const { password: _, ...userResponse } = userData;

    return {
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          uid: userDoc.id,
          ...userResponse,
        },
      },
    };
  }

  // Get user by ID
  async getUserById(userId) {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    const { password, ...userResponse } = userData;

    return {
      uid: userDoc.id,
      ...userResponse,
    };
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const updatedData = {
      ...updateData,
      updatedAt: new Date(),
    };

    await userRef.update(updatedData);

    // Get updated user data
    const updatedUser = await userRef.get();
    const userData = updatedUser.data();
    const { password, ...userResponse } = userData;

    return {
      uid: updatedUser.id,
      ...userResponse,
    };
  }

  // Change password
  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      userData.password
    );
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await userDoc.ref.update({
      password: hashedNewPassword,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  }
}

module.exports = new AuthService();