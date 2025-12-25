import { proxy } from "./proxy";

export default proxy;

// Next.js requires `config` to be statically analyzable in this file (no re-exports).
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


