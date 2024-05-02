const { promisify } = require("util");
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/AppError";
import prisma from "@/lib/prisma";
import express, { Application, Request, Response, NextFunction } from "express";

exports.signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const newUser = await prisma.user.create({
    //   firstName: req.body.firstName,
    //   lastName: req.body.lastName,
    //   email: req.body.email,
    //   password: req.body.password,
    // });
  }
);

// exports.protect = catchAsync(async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }

//   if (!token) {
//     return next(
//       new AppError("You are not logged in! Please log in to get access.", 401)
//     );
//   }

//   // 2) Verification token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   // 3) Check if user still exists
//   const currentUser = await User.findById(decoded.id);
//   if (!currentUser) {
//     return next(
//       new AppError(
//         "The user belonging to this token does no longer exist.",
//         401
//       )
//     );
//   }

//   // 4) Check if user changed password after the token was issued
//   if (currentUser.changedPasswordAfter(decoded.iat)) {
//     return next(
//       new AppError("User recently changed password! Please log in again.", 401)
//     );
//   }

//   // GRANT ACCESS TO PROTECTED ROUTE
//   req.user = currentUser;
//   res.locals.user = currentUser;
//   next();
// });

// exports.restrictTo = (...roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError("You do not have permission to perform this action", 403)
//       );
//     }

//     next();
//   };
// };

// exports.forgotPassword = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     // 1) Get user based on POSTed email
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       return next(new AppError("There is no user with email address.", 404));
//     }

//     // 2) Generate the random reset token
//     const resetToken = user.createPasswordResetToken();
//     await user.save({ validateBeforeSave: false });

//     // 3) Send it to user's email
//     try {
//       const resetURL = `${req.protocol}://${req.get(
//         "host"
//       )}/api/v1/users/resetPassword/${resetToken}`;
//       //   await new Email(user, resetURL).sendPasswordReset();

//       res.status(200).json({
//         status: "success",
//         message: "Token sent to email!",
//       });
//     } catch (err) {
//       user.passwordResetToken = undefined;
//       user.passwordResetExpires = undefined;
//       await user.save({ validateBeforeSave: false });

//       return next(
//         new AppError("There was an error sending the email. Try again later!"),
//         500
//       );
//     }
//   }
// );
