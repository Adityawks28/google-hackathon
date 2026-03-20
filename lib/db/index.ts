import { db } from "@/lib/firebase";
import { ProblemModel } from "@/lib/db/models/problem";
import { UserModel } from "@/lib/db/models/user";
import { ProgressModel } from "@/lib/db/models/progress";
import { SessionModel } from "@/lib/db/models/session";

export const problemModel = ProblemModel(db);
export const userModel = UserModel(db);
export const progressModel = ProgressModel(db);
export const sessionModel = SessionModel(db);
