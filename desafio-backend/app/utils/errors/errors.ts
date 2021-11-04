//Custom exception creation function
export default function CustomException(message: string, statusCode: number) {
	const error: Error = new Error(message);

	error.status = statusCode;
	error.stack = undefined;

	return error;
}

CustomException.prototype = Object.create(Error.prototype);
