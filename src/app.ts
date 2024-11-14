import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { apiRouter } from "./routers";
import cors from "./cors";
import Mongoose from "./db/mongoose";


export let socketApp: express.Application;


export const main = async (): Promise<express.Application> => {
  try {
    const server: express.Application = express()

    await Mongoose.connect();


    server.use(express.json());
    server.use(cors);
    server.use("/api/v1", apiRouter);

    server.get("/", (req: Request, res: Response) => {
      res.send("Lode backend server is Live");
    });

    return server;
  } catch (error) {
    console.error(error.message);
    throw new Error("Unable to connect to database");
  }
};
