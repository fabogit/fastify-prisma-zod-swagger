import prisma  from "../../utils/prisma";

export async function createUser(input) {
	const user = await prisma.user.create({
		data: input,
	});
}
