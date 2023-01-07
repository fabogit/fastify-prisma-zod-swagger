import { hashPassword } from "../../utils/hash";
import prisma from "../../utils/prisma";
import { CreateUserInput } from "./user.schema";

export async function createUser(input: CreateUserInput) {
	const { password, ...data } = input;

	const { hash, salt } = hashPassword(password);

	const user = await prisma.user.create({
		data: { ...data, salt, password: hash },
	});
	return user;
}
