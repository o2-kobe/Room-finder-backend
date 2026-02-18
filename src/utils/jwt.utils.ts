import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import config from "config";

const privateKey = config.get<string>("privateKey");
const publicKey = config.get<string>("publicKey");
const issuer = config.get<string>("issuer");
const audience = config.get<string>("audience");

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: string;
  session: string;
}

export function signJwt(payload: object, options?: SignOptions): string {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    issuer,
    audience,
    ...options,
  });
}

export function verifyJwt(token: string): {
  decoded: AccessTokenPayload | null;
  valid: boolean;
  expired: boolean;
} {
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer,
      audience,
    }) as AccessTokenPayload;

    return {
      decoded,
      valid: true,
      expired: false,
    };
  } catch (error: any) {
    return {
      decoded: null,
      valid: false,
      expired: error.name === "TokenExpiredError",
    };
  }
}
