import { FastifyReply, FastifyRequest } from "fastify";

import { server } from "../../app";
import { isPasswordCorrect } from "../../utils/hash";
import { CreateUserInput, LoginRequest } from "./user.schema";
import { createUser, findUserByEmail } from "./user.service";

export async function registerUserHandler(
	request: FastifyRequest<{
		Body: CreateUserInput;
	}>,
	reply: FastifyReply
) {
	const body = request.body;

	try {
		const user = await createUser(body);
		return reply.code(201).send(user);
	} catch (error) {
		// code 409 or 500
		console.log(error);
		return reply.code(500).send(error);
	}
}

export async function loginHandler(
	request: FastifyRequest<{ Body: LoginRequest; }>,
	reply: FastifyReply
) {
	const body = request.body;

	// find user by email
	const user = await findUserByEmail(body.email);
	if (!user)
		return reply.code(401).send({
			message: "Invalid email/password",
		});

	// verify pwd
	const correctPassword = isPasswordCorrect({
		candidatePassword: body.password,
		salt: user.salt,
		hash: user.password,
	});

	if (correctPassword) {
		const { password, salt, ...rest } = user;
		// generate accessToken
		return { accesToken: server.jwt.sign(rest) };
	}
	return reply.code(401).send({
		message: "Invalid email/password",
	});
	// respond
}
