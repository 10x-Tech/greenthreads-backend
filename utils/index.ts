import {Response} from "express";

export const sendSuccessResponse = (
  res: Response,
  statusCode: number,
  data?: any
) => {
  if (statusCode === 204) return res.status(statusCode);
  else
    return res.status(statusCode).json({
      data,
      success: true,
    });
};
