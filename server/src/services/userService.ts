import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import type { IUser } from "../../../shared/types.js";
import type { RegistrationInput } from "../validation/schemas.js";
import bcrypt from "bcrypt";
import { signUserToken } from "./authTokens.js";

export class UserService {
  private userRepo = AppDataSource.getRepository(User);

  public checkName(username: string): Promise<User | null> {
    return this.userRepo.findOneBy({ username });
  }

  public checkEmail(email: string): Promise<User | null> {
    return this.userRepo.findOneBy({ email });
  }

  public hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  public async create(data: RegistrationInput, hashedPassword: string): Promise<User> {
    // Explicit fields plus INSERT: client ids/relations can never become an UPDATE.
    const newUser = this.userRepo.create({
      username: data.username, email: data.email, password: hashedPassword, height: data.height,
      ...(data.weight !== undefined ? { weight: data.weight } : {}),
      ...(data.birthDate !== undefined ? { birthDate: new Date(data.birthDate) } : {}),
    });
    const result = await this.userRepo.insert(newUser);
    newUser.id = result.identifiers[0]!.id;
    return newUser;
  }

  public async updatePassword(userId: number, newPassword: string, expectedHash: string): Promise<boolean> {
    const result = await this.userRepo.update({ id: userId, password: expectedHash }, { password: newPassword });
    return result.affected === 1;
  }

  public async login(username: string, password: string, remember: boolean): Promise<{ token: string; user: IUser } | null> {
    const user = await this.userRepo.findOne({ where: { username }, relations: ["workouts"] });
    if (!user || !(await bcrypt.compare(password, user.password))) return null;
    return {
      token: signUserToken(user, remember),
      user: {
        id: user.id, username: user.username, email: user.email,
        height: user.height ?? 0, weight: user.weight ?? 0,
        trainingCount: user.workouts.length, birthDate: user.birthDate!,
      },
    };
  }
}
