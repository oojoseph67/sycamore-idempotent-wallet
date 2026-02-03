import { Request, Response } from "express";
import { AppError } from "../../global/errors";
import { LoginDto, SignupDto } from "../../dto";
import { HashingProvider } from "../../global/hashing";
import { COOKIE_NAME, generateToken } from "../../global/jwt/jwt.index";
import { User, Wallet } from "../../models";

export class AuthController {
  constructor(private readonly hashingProvider: HashingProvider) {}

  async signup(req: Request, res: Response) {
    try {
      const signupData = req.body as SignupDto;
      const { email, firstName, lastName, password } = signupData;

      // checking if user exists
      const existingUser = await User.findOne({
        where: { email },
      });

      if (existingUser) {
        throw AppError.conflict({ message: "user already exists" });
      }

      // hashing password
      const hashedPassword = await this.hashingProvider.hashPassword({
        password,
      });

      // creating user
      const user = await User.create({
        email,
        firstName,
        lastName,
        password: hashedPassword,
      });

      // creating wallet
      await Wallet.create({
        userId: user.id,
        balance: 10000,
      });

      const { accessToken } = generateToken({
        userId: user.id,
        res,
      });

      return {
        message: "user signup successful",
        accessToken,
      };
    } catch (error: any) {
      throw AppError.internalServerError({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const loginData = req.body as LoginDto;
      const { email, password } = loginData;

      const existingUser = await User.findOne({
        where: { email },
      });

      if (!existingUser) {
        throw AppError.unauthorized({ message: "invalid email or password" });
      }

      const valid = await this.hashingProvider.comparePasswords({
        password,
        hashedPassword: existingUser.password,
      });

      if (!valid) {
        throw AppError.unauthorized({ message: "invalid email or password" });
      }

      const { accessToken } = generateToken({
        userId: existingUser.id,
        res,
      });

      return {
        message: `login successful`,
        accessToken,
      };
    } catch (error: any) {
      throw AppError.internalServerError({ message: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      return {
        message: `logged out successfully`,
      };
    } catch (error: any) {
      throw AppError.internalServerError({ message: error.message });
    }
  }

  async whoami(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        throw AppError.unauthorized({ message: `user not found` });
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch (error: any) {
      throw AppError.internalServerError({ message: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId);

      if (!user) {
        throw AppError.unauthorized({ message: `user not found` });
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch (error: any) {
      throw AppError.internalServerError({ message: error.message });
    }
  }
}
