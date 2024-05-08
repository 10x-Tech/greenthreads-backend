// import type { Request, Response } from "express";
// import Cookies from "cookies";
// import jwt from "jsonwebtoken";

// export const protect = async (req: Request, res: Response) => {
//   const publicKey = process.env.CLERK_PEM_PUBLIC_KEY;
//   const cookies = new Cookies(req, res);
//   // const sessToken = cookies.get("__session");
//   const token = req.headers.authorization;

//   console.log(publicKey, "COOKIES");
//   if (token === undefined) {
//     res.status(401).json({ error: "not signed in" });
//     return;
//   }

//   try {
//     let decoded: any = "";
//     if (token) {
//       decoded = jwt.verify(token, publicKey);
//       res.status(200).json({ sessToken: decoded });
//       return;
//     } else {
//       decoded = jwt.verify(sessToken, publicKey);
//       res.status(200).json({ sessToken: decoded });
//       return;
//     }
//   } catch (error) {
//     res.status(400).json({
//       error: "Invalid Token",
//     });
//     return;
//   }
// };
