import { NextFunction, Request, Response } from "express";

const parseJsonFields = (req: Request, res: Response, next: NextFunction) => {
  try {
    const jsonFields = [
      "amenities",
      "location",
      "pricing",
      "roomTypes",
      "contact",
    ];

    jsonFields.forEach((field) => {
      if (req.body[field]) {
        req.body[field] = JSON.parse(req.body[field]);
      }
    });

    next();
  } catch (err) {
    next(err);
  }
};

export default parseJsonFields;
